'use client';

import { Tag, Copy, Check, X, ChevronRight, Clock, ShoppingCart, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface Offer {
    id: string;
    code: string;
    type: string;
    value: number;
    minAmount: number;
    maxDiscount: number | null;
    endDate: string | null;
}

interface CartOffersProps {
    compact?: boolean; // For cart drawer compact view
}

export function CartOffers({ compact = false }: CartOffersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const { applyCoupon, couponCode, discountAmount, items } = useCart();
    const { toast } = useToast();

    // Fetch applicable offers based on cart items
    useEffect(() => {
        async function fetchOffers() {
            if (items.length === 0) return;

            try {
                // Get unique category IDs and product IDs from cart
                const productIds = items.map(item => item.productId || item.id);

                // Fetch offers (you'll need to create this endpoint)
                const response = await fetch('/api/offers/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productIds })
                });

                if (response.ok) {
                    const data = await response.json();
                    setOffers(data.offers || []);
                }
            } catch (error) {
                console.error('Failed to fetch offers:', error);
            }
        }

        fetchOffers();
    }, [items]);

    if (offers.length === 0) return null;

    const handleCopyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleApplyCoupon = async (code: string) => {
        const result = await applyCoupon(code);
        if (result.success) {
            toast({ title: `Coupon ${code} applied successfully!` });
            setIsOpen(false);
        } else if (result.message) {
            toast({ title: result.message, variant: 'destructive' });
        }
    };

    const maxSavings = Math.max(...offers.map(o => o.value));
    const savingsType = offers[0].type;
    const appliedOffer = offers.find(o => o.code === couponCode);

    return (
        <>
            {/* Compact Banner */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full border transition-all group text-left",
                    compact ? "p-3" : "p-5",
                    appliedOffer
                        ? "bg-primary/10 border-primary/40 hover:bg-primary/15 hover:border-primary/60"
                        : "bg-secondary/50 border-primary/20 hover:bg-secondary hover:border-primary/40"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            appliedOffer ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground",
                            compact ? "p-1.5" : "p-2"
                        )}>
                            {appliedOffer ? <CheckCircle className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        </div>
                        <div>
                            {appliedOffer ? (
                                <>
                                    <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base", cormorant.className)}>
                                        {appliedOffer.code}
                                    </p>
                                    <p className={cn("text-primary font-medium", compact ? "text-xs" : "text-sm")}>
                                        Saving ₹{discountAmount.toLocaleString('en-IN')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base", cormorant.className)}>
                                        {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'} Available
                                    </p>
                                    <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
                                        Save up to {maxSavings}{savingsType === 'PERCENTAGE' ? '%' : '₹'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
            </button>

            {/* Lightbox Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative bg-background shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-primary/30">
                        <div className="bg-accent p-6 text-accent-foreground relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-accent-foreground/10 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary text-primary-foreground p-2.5">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <h2 className={cn("text-3xl font-light", cormorant.className)}>
                                    Available Offers
                                </h2>
                            </div>
                            <p className="text-accent-foreground/80 ml-12">
                                {appliedOffer ? 'Change your applied offer' : 'Select an offer to apply'}
                            </p>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 bg-background">
                            <div className="space-y-3">
                                {offers.map((offer) => {
                                    const isApplied = offer.code === couponCode;
                                    return (
                                        <div
                                            key={offer.id}
                                            className={cn(
                                                "border p-4 transition-all relative",
                                                isApplied
                                                    ? "bg-primary/10 border-primary/60 shadow-md"
                                                    : "bg-secondary/30 border-border hover:border-primary/40 hover:bg-secondary/50"
                                            )}
                                        >
                                            {isApplied && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Applied
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "border-2 border-dashed px-4 py-1.5",
                                                            isApplied ? "bg-primary/5 border-primary" : "bg-background border-primary/40"
                                                        )}>
                                                            <code className={cn("text-lg font-medium text-primary tracking-widest", cormorant.className)}>
                                                                {offer.code}
                                                            </code>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopyCode(offer.code)}
                                                            className="p-2 hover:bg-secondary transition-colors"
                                                        >
                                                            {copiedCode === offer.code ? (
                                                                <Check className="w-4 h-4 text-accent" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5">
                                                        <span className={cn("font-medium text-lg", cormorant.className)}>
                                                            {offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 text-xs text-muted-foreground">
                                                        {offer.minAmount > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                                                                <span>Min order: ₹{offer.minAmount.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                        {offer.maxDiscount && offer.type === 'PERCENTAGE' && (
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="w-3.5 h-3.5 text-primary" />
                                                                <span>Max discount: ₹{offer.maxDiscount.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                        {offer.endDate && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                                <span>Valid until {new Date(offer.endDate).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short'
                                                                })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleApplyCoupon(offer.code)}
                                                    disabled={isApplied}
                                                    className={cn(
                                                        "px-6 py-2.5 font-medium transition-all whitespace-nowrap tracking-wide uppercase text-xs",
                                                        isApplied
                                                            ? "bg-secondary text-muted-foreground cursor-not-allowed"
                                                            : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    {isApplied ? 'Applied' : 'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-border p-3 bg-secondary/20">
                            <p className="text-xs text-center text-muted-foreground">
                                Only one coupon can be applied per order
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
