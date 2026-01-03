'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { CategoryWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import Image from 'next/image';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500'],
    style: ['italic']
});

interface SliderProps {
    categories: CategoryWithChildren[];
}

export function EditorialCategorySlider({ categories }: SliderProps) {
    const [emblaRef] = useEmblaCarousel({ align: 'start', dragFree: true });

    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-12 border-b border-border/30 bg-white">
            <div className="embla px-4 md:px-12" ref={emblaRef}>
                <div className="embla__container flex gap-8">
                    {categories.map((category) => (
                        <div key={category.id} className="embla__slide flex-none min-w-0">
                            <Link href={`/category/${category.slug}`} className="flex flex-col items-center gap-4 group">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-border/50 group-hover:border-black transition-colors duration-500">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name_en}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
                                            {category.name_en}
                                        </div>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm md:text-base uppercase tracking-widest font-light transition-opacity group-hover:opacity-60",
                                    cormorant.className
                                )}>
                                    {category.name_en}
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
