'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language';
import { WishlistButton } from "./WishlistButton";
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface ProductCardProps {
    product: Product;
    selectedColor?: string;
}

export function ProductCard({ product, selectedColor }: ProductCardProps) {
    const { t } = useLanguage();

    // Robust Image Parsing
    let images: string[] = [];
    try {
        if (Array.isArray(product.images)) {
            images = product.images;
        } else if (typeof (product.images as any) === 'string') {
            // Check if it's a JSON string
            if ((product.images as any).startsWith('[')) {
                images = JSON.parse(product.images as any);
            } else {
                images = [product.images as any];
            }
        }
        // Normalize: Ensure all items are strings (if JSON parsed to generic object?)
        images = images.map(i => String(i));
    } catch (e) {
        images = ['/placeholder.jpg'];
    }

    // Ensure at least one image
    const validImage = (images[0] && images[0].length > 4) ? images[0] : '/placeholder.jpg';
    const secondaryImage = (images[1] && images[1].length > 4) ? images[1] : null;

    return (
        <Link href={`/product/${product.id}`} className="group block space-y-4">
            {/* Image Container - Dominates */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10">
                <Image
                    src={validImage}
                    alt={product.name_en}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Secondary Image on Hover */}
                {images[1] && images[1].length > 4 && (
                    <Image
                        src={images[1]}
                        alt={product.name_en}
                        fill
                        className="object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 absolute inset-0"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

                {/* Wishlist - Top Right */}
                <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
                    <WishlistButton product={product} />
                </div>

                {/* Quick View - Bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <div className="w-full py-3 bg-primary text-primary-foreground text-center text-xs font-medium uppercase tracking-widest shadow-md">
                        View Details
                    </div>
                </div>
            </div>

            {/* Variants Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
                {(() => {
                    if (!product.variants) return null;
                    try {
                        const v = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                        if (v.length > 0) {
                            return (
                                <span className="bg-background/80 backdrop-blur-sm px-2 py-1 text-[10px] uppercase font-medium tracking-wider rounded-sm shadow-sm border border-border/50">
                                    {v.length} Variants
                                </span>
                            );
                        }
                    } catch (e) { }
                })()}
            </div>

            {/* Info - Minimal */}
            <div className="space-y-1">
                <h3 className={cn("text-lg font-light text-foreground line-clamp-1 group-hover:text-primary transition-colors", cormorant.className)}>
                    {t({ en: product.name_en, hi: product.name_hi })}
                </h3>
                <p className="text-sm font-medium text-accent">
                    ₹{product.price.toLocaleString('en-IN')}
                </p>
            </div>
        </Link>
    );
}
