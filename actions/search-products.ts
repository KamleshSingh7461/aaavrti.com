'use server';

import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';

export async function searchProducts(query: string): Promise<any[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchTerm = query.trim();
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex

    try {
        await dbConnect();
        const products = await Product.find({
            $or: [
                { name_en: { $regex: regex } },
                { name_hi: { $regex: regex } },
                { description_en: { $regex: regex } },
                { description_hi: { $regex: regex } },
            ]
        })
            .populate('categoryId')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Map to ensure shape compatibility if needed
        return products.map((p: any) => ({
            ...p,
            id: p._id.toString(),
            category: p.categoryId, // structure depends on populated doc
            price: Number(p.price),
            // parse JSON fields if string
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || []
        }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
