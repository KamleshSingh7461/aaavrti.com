'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import Image from 'next/image';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    style: ['normal', 'italic']
});

interface MinimalGridProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export function MinimalProductGrid({ title, products, viewAllLink }: MinimalGridProps) {
    if (!products || products.length === 0) return null;

    // Limit to 4 or 8 products for a clean grid
    const displayProducts = products.slice(0, 4);

    return (
        <section className="py-20 md:py-32 px-4 md:px-12 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
                <h2 className={cn(
                    "text-4xl md:text-6xl text-black italic font-light",
                    cormorant.className
                )}>
                    {title}
                </h2>

                {viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
                    >
                        View All
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
                {displayProducts.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`} className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                            {product.images?.[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name_en}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-300">No Image</div>
                            )}

                            {/* Quick Add overlay could go here, keeping it clean for now */}
                        </div>

                        <div className="space-y-1">
                            <h3 className={cn(
                                "text-lg text-black font-normal leading-snug group-hover:underline decoration-1 underline-offset-4",
                                cormorant.className
                            )}>
                                {product.name_en}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
