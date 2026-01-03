'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    style: ['normal', 'italic']
});

interface SliderProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export function EditorialProductSlider({ title, products, viewAllLink }: SliderProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { align: 'start', loop: true, skipSnaps: false },
        [Autoplay({ delay: 4000, stopOnInteraction: true })]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!products || products.length === 0) return null;

    return (
        <section className="py-20 md:py-32 bg-white overflow-hidden">
            <div className="px-4 md:px-12 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <h2 className={cn(
                    "text-4xl md:text-6xl text-black italic font-light",
                    cormorant.className
                )}>
                    {title}
                </h2>

                <div className="flex items-center gap-8">
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
                        >
                            View All
                        </Link>
                    )}
                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={scrollPrev} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={scrollNext} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="embla px-4 md:px-12" ref={emblaRef}>
                <div className="embla__container flex gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="embla__slide flex-[0_0_80%] sm:flex-[0_0_40%] lg:flex-[0_0_22%] min-w-0">
                            <Link href={`/product/${product.slug}`} className="group block">
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name_en}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 22vw"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-300">No Image</div>
                                    )}
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
