'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CategoryWithChildren } from '@/lib/types';
import { useLanguage } from '@/lib/language';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface CategoryCarouselProps {
    categories: CategoryWithChildren[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
    const { t } = useLanguage();

    return (
        <section className="py-12 bg-secondary/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className={cn("text-3xl md:text-4xl font-medium", cormorant.className)}>
                        Shop by Category
                    </h2>
                    <Link href="/products" className="text-sm border-b-0 hover:text-primary transition-colors pb-0.5">
                        View All
                    </Link>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {categories.map((category, index) => (
                            <CarouselItem key={category.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                                <Link href={`/category/${category.slug}`}>
                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100">
                                            {category.image ? (
                                                <Image
                                                    src={category.image}
                                                    alt={category.name_en}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                    priority={index < 4}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center text-muted-foreground group-hover:bg-secondary/40 transition-colors">
                                                    <span className={cn("text-4xl opacity-20", cormorant.className)}>{category.name_en.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className={cn("text-xl text-center group-hover:text-primary transition-colors", cormorant.className)}>
                                            {t({ en: category.name_en, hi: category.name_hi })}
                                        </h3>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-4" />
                        <CarouselNext className="-right-4" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
