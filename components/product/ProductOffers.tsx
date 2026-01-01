'use client';

import { Tag, Copy, Check, X, ChevronRight, Clock, ShoppingCart, CheckCircle } from 'lucide-react';
import { useState } from 'react';
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

interface ProductOffersProps {
    offers: Offer[];
}

export function ProductOffers({ offers }: ProductOffersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const { applyCoupon, couponCode, discountAmount } = useCart();
    const { toast } = useToast();

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
            {/* Compact Offer Banner */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full border p-5 relative overflow-hidden transition-all group",
                    appliedOffer
                        ? "bg-primary/10 border-primary/40 hover:bg-primary/15 hover:border-primary/60"
                        : "bg-secondary/50 border-primary/20 hover:bg-secondary hover:border-primary/40"
                )}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-2.5",
                            appliedOffer ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"
                        )}>
                            {appliedOffer ? <CheckCircle className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                            {appliedOffer ? (
                                <>
                                    <h3 className={cn("font-medium text-lg text-foreground mb-0.5", cormorant.className)}>
                                        Coupon Applied: {appliedOffer.code}
                                    </h3>
                                    <p className="text-sm text-primary font-medium">
                                        Saving ₹{discountAmount.toLocaleString('en-IN')} • Click to change
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className={cn("font-medium text-lg text-foreground mb-0.5", cormorant.className)}>
                                        {offers.length} Special {offers.length === 1 ? 'Offer' : 'Offers'} Available
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Save up to {maxSavings}{savingsType === 'PERCENTAGE' ? '%' : '₹'} • Click to view
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
            </button>

            {/* Lightbox Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-background shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-primary/30">
                        {/* Header */}
                        <div className="bg-accent p-8 text-accent-foreground relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-accent-foreground/10 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-primary text-primary-foreground p-3">
                                    <Tag className="w-7 h-7" />
                                </div>
                                <h2 className={cn("text-4xl font-light", cormorant.className)}>
                                    Available Offers
                                </h2>
                            </div>
                            <p className="text-accent-foreground/80 ml-16">
                                {appliedOffer ? 'Change your applied offer or select a different one' : 'Select an offer to apply to your order'}
                            </p>
                        </div>

                        {/* Offers List */}
                        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6 bg-background">
                            <div className="space-y-4">
                                {offers.map((offer, index) => {
                                    const isApplied = offer.code === couponCode;
                                    return (
                                        <div
                                            key={offer.id}
                                            className={cn(
                                                "border p-6 transition-all group relative",
                                                isApplied
                                                    ? "bg-primary/10 border-primary/60 shadow-md"
                                                    : "bg-secondary/30 border-border hover:border-primary/40 hover:bg-secondary/50"
                                            )}
                                        >
                                            {/* Applied Badge */}
                                            {isApplied && (
                                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Applied
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between gap-6">
                                                <div className="flex-1 space-y-4">
                                                    {/* Coupon Code */}
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "border-2 border-dashed px-5 py-2.5",
                                                            isApplied ? "bg-primary/5 border-primary" : "bg-background border-primary/40"
                                                        )}>
                                                            <code className={cn("text-xl font-medium text-primary tracking-widest", cormorant.className)}>
                                                                {offer.code}
                                                            </code>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopyCode(offer.code)}
                                                            className="p-2.5 hover:bg-secondary transition-colors"
                                                            title="Copy code"
                                                        >
                                                            {copiedCode === offer.code ? (
                                                                <Check className="w-5 h-5 text-accent" />
                                                            ) : (
                                                                <Copy className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Discount Badge */}
                                                    <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2">
                                                        <span className={cn("font-medium text-xl", cormorant.className)}>
                                                            {offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                                                        </span>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                        {offer.minAmount > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <ShoppingCart className="w-4 h-4 text-primary" />
                                                                <span>Minimum order: ₹{offer.minAmount.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                        {offer.maxDiscount && offer.type === 'PERCENTAGE' && (
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="w-4 h-4 text-primary" />
                                                                <span>Maximum discount: ₹{offer.maxDiscount.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                        {offer.endDate && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-primary" />
                                                                <span>Valid until {new Date(offer.endDate).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Apply Button */}
                                                <button
                                                    onClick={() => handleApplyCoupon(offer.code)}
                                                    disabled={isApplied}
                                                    className={cn(
                                                        "px-8 py-3 font-medium transition-all whitespace-nowrap tracking-wide uppercase text-sm",
                                                        isApplied
                                                            ? "bg-secondary text-muted-foreground cursor-not-allowed"
                                                            : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    {isApplied ? 'Applied' : 'Apply Now'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border p-4 bg-secondary/20">
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
