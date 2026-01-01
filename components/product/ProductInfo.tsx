'use client';

import { useLanguage } from '@/lib/language';
import { Product } from '@/lib/types';
import { Heart, ShieldCheck, Truck } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';

export function ProductInfo({ product }: { product: Product }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-serif text-foreground font-medium">
                    {t({ en: product.name_en, hi: product.name_hi })}
                </h1>
            </div>

            <div className="text-2xl font-semibold">
                ₹{product.price.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                    {t({ en: 'inclusive of all taxes', hi: 'सभी कर सहित' })}
                </span>
            </div>

            <div className="prose text-muted-foreground leading-relaxed">
                <p>{t({ en: product.description_en, hi: product.description_hi })}</p>
            </div>

            {/* Size Selector Mock */}
            {product.attributes.size && (
                <div className="space-y-3">
                    <span className="text-sm font-medium uppercase tracking-wide">
                        {t({ en: 'Select Size', hi: 'साइज़ चुनें' })}
                    </span>
                    <div className="flex gap-3">
                        {product.attributes.size.map((size: string) => (
                            <button
                                key={size}
                                className="w-12 h-12 flex items-center justify-center border border-border rounded-full hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-border">
                <div className="flex-1">
                    <AddToCartButton product={product} />
                </div>
                <WishlistButton product={product} className="h-12 w-12 border border-border bg-background hover:bg-secondary" />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>{t({ en: 'Free Shipping across India', hi: 'पुरे भारत में मुफ्त शिपिंग' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>{t({ en: '100% Authentic Handloom', hi: '१००% असली हथकरघा' })}</span>
                </div>
            </div>
        </div>
    );
}
