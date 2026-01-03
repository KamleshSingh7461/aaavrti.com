'use server';

import { auth } from '@/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { WishlistItem } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Login required" };
    }

    const userId = session.user.id!;

    try {
        await dbConnect();
        const existing = await WishlistItem.findOne({
            userId,
            productId
        });

        if (existing) {
            await WishlistItem.findByIdAndDelete(existing._id);
            revalidatePath('/account/wishlist');
            return { added: false };
        } else {
            // Check if product exists first? Optional but safe
            await WishlistItem.create({
                userId,
                productId
            });
            revalidatePath('/account/wishlist');
            return { added: true };
        }
    } catch (error) {
        console.error('Wishlist toggle error', error);
        return { error: "Failed to update wishlist" };
    }
}

export async function getWishlist() {
    const session = await auth();
    if (!session?.user) return [];

    try {
        await dbConnect();
        const items = await WishlistItem.find({ userId: session.user.id })
            .populate({
                path: 'productId',
                populate: { path: 'categoryId' } // optional deep populate if needed
            })
            .sort({ createdAt: -1 })
            .lean();

        return items.map((item: any) => {
            const p = item.productId;
            if (!p) return null; // Handle deleted products

            // Handle JSON/Array inconsistencies
            let attributes = p.attributes;
            if (typeof p.attributes === 'string') {
                try { attributes = JSON.parse(p.attributes); } catch { }
            }

            let variants = p.variants;
            if (typeof p.variants === 'string') {
                try { variants = JSON.parse(p.variants); } catch { }
            }

            let images = p.images || [];
            if (typeof p.images === 'string') {
                try { images = JSON.parse(p.images); } catch { }
            }

            return {
                id: p._id.toString(),
                name_en: p.name_en,
                name_hi: p.name_hi,
                slug: p.slug,
                sku: p.sku,
                price: Number(p.price),
                attributes,
                variants,
                images,
                category: p.categoryId, // structure depends on populate
                wishlistItemId: item._id.toString()
            };
        }).filter((i: any) => i !== null);
    } catch (e) {
        console.error("Failed to fetch wishlist:", e);
        return [];
    }
}

export async function syncWishlist(productIds: string[]) {
    const session = await auth();
    if (!session?.user || !productIds.length) return;

    const userId = session.user.id!;

    try {
        await dbConnect();
        // Find what we already have
        const existing = await WishlistItem.find({
            userId,
            productId: { $in: productIds }
        }).select('productId');

        const existingIds = new Set(existing.map((e: any) => e.productId.toString()));
        let validNewIds = productIds.filter(id => !existingIds.has(id));

        if (validNewIds.length > 0) {
            // Verify products exist with robust ID check
            const objectIds = validNewIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
            const validProducts = await Product.find({
                $or: [
                    { _id: { $in: validNewIds } },
                    { _id: { $in: objectIds } }
                ]
            }).select('_id');
            const validProductSet = new Set(validProducts.map((p: any) => p._id.toString()));
            validNewIds = validNewIds.filter(id => validProductSet.has(id));
        }

        if (validNewIds.length > 0) {
            await WishlistItem.insertMany(
                validNewIds.map(productId => ({
                    userId,
                    productId
                }))
            );
            revalidatePath('/account/wishlist');
        }
    } catch (e) {
        console.error('Error syncing wishlist:', e);
    }
}
