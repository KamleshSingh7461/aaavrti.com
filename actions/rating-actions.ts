'use server';

import dbConnect from '@/lib/db';
import { Review } from '@/lib/models/Product';

export async function getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    try {
        await dbConnect();

        const reviews = await Review.find({ productId }).select('rating').lean();

        if (reviews.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / reviews.length;

        return {
            average: Math.round(average * 10) / 10, // Round to 1 decimal
            count: reviews.length
        };
    } catch (error) {
        console.error('Failed to get average rating:', error);
        return { average: 0, count: 0 };
    }
}

export async function getProductsWithRatings(productIds: string[]) {
    try {
        await dbConnect();

        const ratings = await Promise.all(
            productIds.map(async (id) => ({
                productId: id,
                ...(await getAverageRating(id))
            }))
        );

        return ratings;
    } catch (error) {
        console.error('Failed to get products with ratings:', error);
        return [];
    }
}
