'use client';

import { useState } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { createReview } from '@/actions/review-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface ProductReviewsProps {
    productId: string;
    reviews: Review[];
    canReview: boolean;
}

export function ProductReviews({ productId, reviews, canReview }: ProductReviewsProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        const result = await createReview(productId, rating, comment);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            // Typically we'd force a refresh or optimistically update, 
            // but server action revalidates path so a router.refresh() might be needed 
            // or just let next.js handle it.
            window.location.reload(); // Simple refresh to see new review
        } else {
            toast.error(result.error || 'Failed to submit review');
        }
    };

    return (
        <div className="space-y-12 py-12 border-t border-border/10">
            <h2 className="text-2xl font-serif text-center">Customer Reviews</h2>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Review List */}
                <div className="space-y-8">
                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="space-y-2 border-b border-border/10 pb-6 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-4 h-4 ${s <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">{review.user.name || 'Anonymous'}</span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                                <p className="text-xs text-muted-foreground/50">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Review Form */}
                {canReview ? (
                    <div className="bg-secondary/10 p-8 rounded-none border border-border/10">
                        <h3 className="text-lg font-medium mb-6">Write a Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${s <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Review</label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="resize-none rounded-none border-foreground/10 focus:border-foreground min-h-[100px]"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-none"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-8 bg-secondary/5 border border-border/10 text-center">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">
                                Only verified customers who have purchased and received this product can write a review.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
