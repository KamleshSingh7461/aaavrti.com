'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { ProductView, Product } from '@/lib/models/Product';

export async function syncViewHistory(productIds: string[]) {
    const session = await auth();
    if (!session?.user?.id || !productIds.length) return;

    try {
        await dbConnect();
        for (const pid of productIds) {
            // Check if product exists to avoid referencing bad IDs
            const productExists = await Product.exists({ _id: pid });
            if (!productExists) continue;

            await ProductView.findOneAndUpdate(
                { userId: session.user.id, productId: pid },
                { viewedAt: new Date() },
                { upsert: true, new: true }
            );
        }

    } catch (error) {
        console.error('Failed to sync history:', error);
    }
}

export async function getViewHistory() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        await dbConnect();
        const views = await ProductView.find({ userId: session.user.id })
            .sort({ viewedAt: -1 })
            .limit(12)
            .populate('productId')
            .lean();

        return views.map((v: any) => {
            const product = v.productId;
            if (!product) return null;

            let images = product.images || [];
            if (typeof product.images === 'string') {
                try { images = JSON.parse(product.images); } catch { }
            }

            return {
                id: product._id.toString(),
                name_en: product.name_en,
                name_hi: product.name_hi,
                slug: product.slug,
                price: Number(product.price),
                images,
                // Minimal fields needed for card
            };
        }).filter((p: any) => p !== null);
    } catch (error) {
        console.error('Failed to get view history:', error);
        return [];
    }
}
