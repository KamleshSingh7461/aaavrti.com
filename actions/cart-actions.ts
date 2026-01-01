'use server';

import { prisma } from '@/lib/db';

export async function getRecommendedProducts(cartItemIds: string[], limit: number = 4) {
    try {
        // Get categories of items in cart
        const cartItems = await prisma.product.findMany({
            where: { id: { in: cartItemIds } },
            select: { categoryId: true }
        });

        const categoryIds = [...new Set(cartItems.map(item => item.categoryId))];

        // Get recommended products from same categories, excluding cart items
        const recommended = await prisma.product.findMany({
            where: {
                categoryId: { in: categoryIds },
                id: { notIn: cartItemIds }
            },
            take: limit,
            orderBy: [
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                name_en: true,
                name_hi: true,
                slug: true,
                images: true,
                price: true,
                category: {
                    select: {
                        name_en: true
                    }
                }
            }
        });

        // If not enough products from same category, get popular products
        if (recommended.length < limit) {
            const additional = await prisma.product.findMany({
                where: {
                    id: { notIn: [...cartItemIds, ...recommended.map(p => p.id)] }
                },
                take: limit - recommended.length,
                orderBy: [
                    { createdAt: 'desc' }
                ],
                select: {
                    id: true,
                    name_en: true,
                    name_hi: true,
                    slug: true,
                    images: true,
                    price: true,
                    category: {
                        select: {
                            name_en: true
                        }
                    }
                }
            });

            recommended.push(...additional);
        }

        // Convert Decimal to number and handle images
        return recommended.map(product => {
            // Parse images if it's a string
            let images: string[] = [];
            if (typeof product.images === 'string') {
                try {
                    images = JSON.parse(product.images);
                } catch {
                    images = [];
                }
            } else if (Array.isArray(product.images)) {
                images = product.images;
            }

            return {
                ...product,
                price: Number(product.price),
                compareAtPrice: null,
                images
            };
        });

    } catch (error) {
        console.error('Error fetching recommended products:', error);
        return [];
    }
}
