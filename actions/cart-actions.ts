'use server';

import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';

export async function getRecommendedProducts(cartItemIds: string[], limit: number = 4) {
    try {
        await dbConnect();
        // Get categories of items in cart
        const cartItems = await Product.find({ _id: { $in: cartItemIds } }).select('categoryId');

        const categoryIds = [...new Set(cartItems.map(item => item.categoryId))];

        // Get recommended products from same categories, excluding cart items
        let recommended = await Product.find({
            categoryId: { $in: categoryIds },
            _id: { $nin: cartItemIds }
        })
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('categoryId', 'name_en')
            .lean();

        // If not enough products from same category, get popular products
        if (recommended.length < limit) {
            const excludedIds = [...cartItemIds, ...recommended.map((p: any) => p._id.toString())];

            const additional = await Product.find({
                _id: { $nin: excludedIds }
            })
                .limit(limit - recommended.length)
                .sort({ createdAt: -1 })
                .populate('categoryId', 'name_en')
                .lean();

            recommended.push(...additional);
        }

        // Convert Decimal to number and handle images
        return recommended.map((product: any) => {
            // Handle images if it's a string (though Schema says array of strings, safety check)
            let images: string[] = [];
            if (Array.isArray(product.images)) {
                images = product.images;
            }

            return {
                id: product._id.toString(),
                name_en: product.name_en,
                name_hi: product.name_hi,
                slug: product.slug,
                images: images,
                price: Number(product.price),
                category: product.categoryId ? {
                    name_en: product.categoryId.name_en
                } : null,
                compareAtPrice: null,
            };
        });

    } catch (error) {
        console.error('Error fetching recommended products:', error);
        return [];
    }
}
