'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Login required" };
    }

    const userId = session.user.id!;

    try {
        const existing = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (existing) {
            await prisma.wishlistItem.delete({
                where: { id: existing.id }
            });
            revalidatePath('/account/wishlist');
            return { added: false };
        } else {
            await prisma.wishlistItem.create({
                data: {
                    userId,
                    productId
                }
            });
            revalidatePath('/account/wishlist');
            return { added: true };
        }
    } catch (error) {
        return { error: "Failed to update wishlist" };
    }
}

export async function getWishlist() {
    const session = await auth();
    if (!session?.user) return [];

    const items = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: {
            product: {
                include: {
                    category: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return items.map((item: { product: any }) => {
        const p = item.product;
        return {
            ...p,
            price: Number(p.price),
            attributes: typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes,
            variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
        };
    });
}

export async function syncWishlist(productIds: string[]) {
    const session = await auth();
    if (!session?.user || !productIds.length) return;

    const userId = session.user.id!;

    // Find what we already have
    const existing = await prisma.wishlistItem.findMany({
        where: {
            userId,
            productId: { in: productIds }
        },
        select: { productId: true }
    });

    const existingIds = new Set(existing.map((e: { productId: string }) => e.productId));
    let validNewIds = productIds.filter(id => !existingIds.has(id));

    if (validNewIds.length > 0) {
        // Verify products exist to prevent FK errors
        const validProducts = await prisma.product.findMany({
            where: { id: { in: validNewIds } },
            select: { id: true }
        });
        const validProductSet = new Set(validProducts.map(p => p.id));
        validNewIds = validNewIds.filter(id => validProductSet.has(id));
    }

    if (validNewIds.length > 0) {
        await prisma.$transaction(
            validNewIds.map(productId =>
                prisma.wishlistItem.create({
                    data: { userId, productId }
                })
            )
        );
        revalidatePath('/account/wishlist');
    }
}
