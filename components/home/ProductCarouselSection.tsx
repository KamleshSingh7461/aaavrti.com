'use client';

import Link from 'next/link';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/product/ProductCard';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface ProductCarouselSectionProps {
    title: string;
    products: any[]; // Using any to avoid complex nested relations types for now
    viewAllLink?: string;
    description?: string;
}

export function ProductCarouselSection({ title, products, viewAllLink, description }: ProductCarouselSectionProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 border-b border-border/5">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-8">
                    <div className="max-w-2xl">
                        <h2 className={cn("text-3xl md:text-4xl font-medium mb-2", cormorant.className)}>
                            {title}
                        </h2>
                        {description && <p className="text-muted-foreground">{description}</p>}
                    </div>
                    {viewAllLink && (
                        <Link href={viewAllLink} className="text-sm border-b border-foreground/50 hover:border-foreground transition-colors pb-0.5 whitespace-nowrap">
                            View All
                        </Link>
                    )}
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[70%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <ProductCard product={product} />
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
