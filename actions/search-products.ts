'use server';

import { prisma } from '@/lib/db';
import { Product } from '@/lib/types';

export async function searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchTerm = query.trim();

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name_en: { contains: searchTerm } },
                    { name_hi: { contains: searchTerm } },
                    { description_en: { contains: searchTerm } },
                    { description_hi: { contains: searchTerm } },
                ],
            },
            include: {
                category: true,
            },
            take: 10, // Limit results
            orderBy: {
                createdAt: 'desc',
            },
        });

        return products as unknown as Product[];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
