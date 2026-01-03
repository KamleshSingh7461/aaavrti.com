'use client';

import { useState, useMemo } from 'react';
import { Star, User as UserIcon, ThumbsUp, ChevronDown } from 'lucide-react';
import { createReview } from '@/actions/review-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

    // Calculate rating statistics
    const stats = useMemo(() => {
        if (reviews.length === 0) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

        const distribution = [0, 0, 0, 0, 0];
        let sum = 0;

        reviews.forEach(review => {
            distribution[review.rating - 1]++;
            sum += review.rating;
        });

        return {
            average: sum / reviews.length,
            total: reviews.length,
            distribution: distribution.reverse(), // 5 stars first
        };
    }, [reviews]);

    // Sort reviews
    const sortedReviews = useMemo(() => {
        const sorted = [...reviews];
        if (sortBy === 'highest') {
            return sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'lowest') {
            return sorted.sort((a, b) => a.rating - b.rating);
        }
        return sorted; // Already sorted by newest from server
    }, [reviews, sortBy]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        setIsSubmitting(true);
        const result = await createReview(productId, rating, comment);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            window.location.reload();
        } else {
            toast.error(result.error || 'Failed to submit review');
        }
    };

    return (
        <div className="space-y-12 py-12 border-t border-border/10">
            <h2 className="text-3xl font-serif text-center">Customer Reviews</h2>

            {/* Rating Summary */}
            {reviews.length > 0 && (
                <div className="bg-secondary/5 border border-border/10 p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Average Rating */}
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="text-6xl font-light">{stats.average.toFixed(1)}</div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            "w-6 h-6",
                                            s <= Math.round(stats.average)
                                                ? 'fill-primary text-primary'
                                                : 'text-muted-foreground/30'
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars, index) => {
                                const count = stats.distribution[index];
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                                return (
                                    <div key={stars} className="flex items-center gap-3">
                                        <span className="text-sm w-12">{stars} star</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-12">
                {/* Review List */}
                <div className="space-y-6">
                    {/* Sort Dropdown */}
                    {reviews.length > 1 && (
                        <div className="flex items-center justify-between border-b border-border/10 pb-4">
                            <h3 className="font-medium">All Reviews ({reviews.length})</h3>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="appearance-none bg-transparent border border-border/20 rounded px-4 py-2 pr-10 text-sm focus:outline-none focus:border-primary cursor-pointer"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    {sortedReviews.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <div className="flex gap-1 justify-center opacity-20">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-8 h-8 text-muted-foreground" />
                                ))}
                            </div>
                            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedReviews.map((review) => (
                                <div key={review.id} className="space-y-3 border-b border-border/10 pb-6 last:border-0">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <span className="font-medium text-sm">
                                                    {review.user.name || 'Anonymous'}
                                                </span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={cn(
                                                            "w-4 h-4",
                                                            s <= review.rating
                                                                ? 'fill-primary text-primary'
                                                                : 'text-muted-foreground/30'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Review Content */}
                                    {review.comment && (
                                        <p className="text-sm leading-relaxed text-foreground/90">
                                            {review.comment}
                                        </p>
                                    )}

                                    {/* Verified Purchase Badge */}
                                    <div className="flex items-center gap-2 text-xs text-green-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Verified Purchase</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Form */}
                {canReview ? (
                    <div className="bg-secondary/10 p-8 rounded-none border border-border/10 h-fit sticky top-24">
                        <h3 className="text-xl font-serif mb-6">Write a Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Your Rating *</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            onMouseEnter={() => setHoverRating(s)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-8 h-8 transition-colors",
                                                    s <= (hoverRating || rating)
                                                        ? 'fill-primary text-primary'
                                                        : 'text-muted-foreground/30'
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {rating === 5 && "Excellent!"}
                                        {rating === 4 && "Very Good!"}
                                        {rating === 3 && "Good"}
                                        {rating === 2 && "Fair"}
                                        {rating === 1 && "Poor"}
                                    </p>
                                )}
                            </div>

                            {/* Review Text */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Your Review *</label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    className="resize-none rounded-none border-foreground/10 focus:border-foreground min-h-[120px]"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 10 characters ({comment.length}/10)
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || rating === 0 || comment.length < 10}
                                className="w-full rounded-none h-12 text-base"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                By submitting, you agree to our review guidelines
                            </p>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-12 bg-secondary/5 border border-border/10 text-center h-fit">
                        <div className="space-y-3 max-w-sm">
                            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                                <Star className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h4 className="font-medium">Purchase to Review</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Only verified customers who have purchased and received this product can write a review.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
