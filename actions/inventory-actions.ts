'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function getInventory() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return [];

    try {
        await dbConnect();
        const products = await Product.find()
            .select('name_en sku stock variants images slug')
            .sort({ name_en: 1 })
            .lean();

        // Flatten logic for table view
        const inventoryItems: any[] = [];

        products.forEach((product: any) => {
            const images = Array.isArray(product.images) ? product.images : [];
            const mainImage = images[0] || '/placeholder.png';

            // Check if variants exists and is an array (Mixed type)
            let variants = [];
            if (Array.isArray(product.variants)) {
                variants = product.variants;
            } else if (typeof product.variants === 'string') {
                try {
                    variants = JSON.parse(product.variants);
                } catch (e) { variants = [] }
            }

            if (variants.length > 0) {
                variants.forEach((v: any) => {
                    inventoryItems.push({
                        productId: product._id.toString(),
                        id: v.id,
                        name: `${product.name_en} - ${v.name || 'Variant'}`,
                        sku: `${product.sku}-${v.id.split('-').pop()}`,
                        stock: v.stock || 0,
                        image: mainImage, // Could use variant image if available
                        isVariant: true,
                        slug: product.slug
                    });
                });
                return;
            }

            // Simple product or no variants
            inventoryItems.push({
                productId: product._id.toString(),
                id: product._id.toString(),
                name: product.name_en,
                sku: product.sku,
                stock: product.stock,
                image: mainImage,
                isVariant: false,
                slug: product.slug
            });
        });

        return inventoryItems;
    } catch (error) {
        console.error('Failed to get inventory:', error);
        return [];
    }
}

export async function updateStock(productId: string, variantId: string, newStock: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();

        if (productId === variantId) {
            // Simple product update
            await Product.findByIdAndUpdate(productId, { stock: newStock });
        } else {
            // Variant update
            const product = await Product.findById(productId);
            if (!product || !product.variants) return { error: 'Product not found' };

            let variants: any[] = [];
            if (Array.isArray(product.variants)) {
                variants = product.variants;
            } else if (typeof product.variants === 'string') {
                try {
                    variants = JSON.parse(product.variants);
                } catch (e) { variants = [] }
            }

            const variantIndex = variants.findIndex((v: any) => v.id === variantId);

            if (variantIndex === -1) return { error: 'Variant not found' };

            variants[variantIndex].stock = newStock;

            // Recalculate total stock
            const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);

            // If it was stored as string, invoke stringify? Or save as object?
            // Schema says Mixed. We should safe keeping it consistent. 
            // If it came as array, save as array.

            await Product.findByIdAndUpdate(productId, {
                variants: variants, // Mongoose Mixed allows array/object directly
                stock: totalStock
            });
        }

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        console.error('Failed to update stock:', error);
        return { error: 'Failed to update stock' };
    }
}
