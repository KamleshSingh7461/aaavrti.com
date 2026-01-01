'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function syncViewHistory(productIds: string[]) {
    const session = await auth();
    if (!session?.user?.id || !productIds.length) return;

    try {
        // We want to add these to history if not already viewed recently?
        // Actually, just add them. `viewedAt` will handle order.
        // To avoid duplicates spam, maybe check last view?
        // But for "sync setup", users usually dump distinct list from LS.

        // Filter valid products
        // Optimization: upsert or createMany? 
        // createMany is not supported in SQLite for ignore duplicates elegantly without raw query?
        // Actually, we just want to track "User viewed X". 
        // If we want "Recently viewed", unique per product is better.
        // Let's iterate and Upsert (update viewedAt if exists) or just create entries.
        // Design: "Last viewed at". So upsert is best.

        for (const pid of productIds) {
            // Find existing view for this product by this user
            const existing = await prisma.productView.findFirst({
                where: { userId: session.user.id, productId: pid }
            });

            if (existing) {
                await prisma.productView.update({
                    where: { id: existing.id },
                    data: { viewedAt: new Date() }
                });
            } else {
                // Check if product exists to avoid FK error
                const product = await prisma.product.findUnique({ where: { id: pid } });
                if (product) {
                    await prisma.productView.create({
                        data: {
                            userId: session.user.id,
                            productId: pid,
                            viewedAt: new Date()
                        }
                    });
                }
            }
        }

    } catch (error) {
        console.error('Failed to sync history:', error);
    }
}

export async function getViewHistory() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const views = await prisma.productView.findMany({
            where: { userId: session.user.id },
            orderBy: { viewedAt: 'desc' },
            take: 12, // Show last 12
            include: {
                product: true // Get basic product details
            }
        });

        return views.map(v => ({
            ...v.product,
            price: Number(v.product.price),
            images: JSON.parse(v.product.images),
            // Minimal fields needed for card
        }));
    } catch (error) {
        console.error('Failed to get view history:', error);
        return [];
    }
}
