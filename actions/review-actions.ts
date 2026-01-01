'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Checks if the current user can review a specific product.
 * Policy: User must have purchased the product, the order must be DELIVERED, 
 * and the item must NOT be refunded.
 */
export async function canReviewProduct(productId: string) {
    const session = await auth();
    if (!session?.user?.id) return false;

    try {
        // Find a valid order item
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                productId: productId,
                order: {
                    userId: session.user.id,
                    status: 'DELIVERED', // Strict check for delivery
                    // Ensure order is not fully refunded/cancelled if that logic existed on Order level
                },
                // Ensure this specific item wasn't returned/refunded
                // We check if there are any ReturnItems linked to this OrderItem with status REFUNDED or APPROVED
                // Actually, simplest is to check if returnItems is empty or none are 'REFUNDED'
                returnItems: {
                    none: {
                        returnRequest: {
                            status: { in: ['APPROVED', 'REFUNDED'] }
                        }
                    }
                }
            },
            include: {
                returnItems: true // just to be safe
            }
        });

        // Also check if user already reviewed?
        // Usually users can verify multiple times if they bought multiple times, 
        // but typically one review per product per user is standard constraint.
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: session.user.id,
                productId: productId
            }
        });

        if (existingReview) return false; // Already reviewed

        return !!orderItem;

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return false;
    }
}

export async function createReview(productId: string, rating: number, comment: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    if (!rating || rating < 1 || rating > 5) return { error: 'Invalid rating' };

    try {
        const canReview = await canReviewProduct(productId);
        if (!canReview) {
            return { error: 'You can only review products you have purchased and received.' };
        }

        await prisma.review.create({
            data: {
                userId: session.user.id,
                productId,
                rating,
                comment,
            }
        });

        revalidatePath(`/product/${productId}`);
        return { success: true };

    } catch (error) {
        console.error('Failed to create review:', error);
        return { error: 'Failed to submit review' };
    }
}

export async function getProductReviews(productId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });
        return reviews;
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return [];
    }
}
