'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language';
import { WishlistButton } from "./WishlistButton";
import { Cormorant_Garamond } from 'next/font/google';
import { useCompare } from '@/context/compare-context';
import { ArrowLeftRight, Check } from 'lucide-react';

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
    const { addToCompare, isInCompare, removeFromCompare } = useCompare();
    // Handle both id (frontend) and _id (backend)
    const productId = product.id || (product as any)._id;
    const isInComparison = isInCompare(productId);

    const handleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInComparison) {
            removeFromCompare(productId);
        } else {
            // Ensure we pass both id and _id to context for consistency
            addToCompare({ ...product, _id: productId } as any);
        }
    };

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

    // Futuristic Product Card Return
    // Immersive Futuristic Card Return
    return (
        <Link href={`/product/${product.slug}`} className="group relative block w-full aspect-[3/4] overflow-hidden bg-neutral-100 isolate">
            {/* 1. Images */}
            <Image
                src={validImage}
                alt={product.name_en}
                fill
                className={cn(
                    "object-cover transition-transform duration-700 ease-bounce group-hover:scale-110",
                    secondaryImage ? "group-hover:opacity-0" : ""
                )}
                sizes="(max-width: 768px) 50vw, 33vw"
            />
            {secondaryImage && (
                <Image
                    src={secondaryImage}
                    alt={product.name_en}
                    fill
                    className="object-cover transition-transform duration-700 ease-bounce scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 absolute inset-0"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
            )}

            {/* 2. Cinematic Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

            {/* 3. Top Action Bar (Floating) */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                {/* Wishlist */}
                <div className="bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black rounded-full p-2 transition-colors border border-white/20">
                    <WishlistButton product={product} />
                </div>
                {/* Compare */}
                <button
                    onClick={handleCompare}
                    className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-300",
                        isInComparison
                            ? "bg-primary border-primary text-white"
                            : "bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black"
                    )}
                    title="Compare"
                >
                    {isInComparison ? <Check className="h-5 w-5" /> : <ArrowLeftRight className="h-5 w-5" />}
                </button>
            </div>

            {/* 4. Status Badges */}
            <div className="absolute top-4 left-4 z-10">
                {(() => {
                    if (!product.variants) return null;
                    try {
                        const v = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                        if (v.length > 0) {
                            return (
                                <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                                    {v.length} Styles
                                </span>
                            );
                        }
                    } catch (e) { }
                })()}
            </div>

            {/* 5. Bottom Info Content (Immersive) */}
            <div className="absolute bottom-0 inset-x-0 p-6 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <div className="space-y-2 mb-4 group-hover:mb-2 transition-[margin] duration-500">
                    <h3 className={cn("text-xl font-light text-white leading-tight tracking-wide", cormorant.className)}>
                        {t({ en: product.name_en, hi: product.name_hi })}
                    </h3>
                    <p className="text-primary font-medium tracking-widest text-sm">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Hidden Action Button Reveal */}
                <div className="h-0 opacity-0 group-hover:h-12 group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden">
                    <button className="w-full bg-white text-black h-12 text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                        Quick View
                    </button>
                </div>
            </div>

            {/* 6. Active Border Glow */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
        </Link>
    );
}
