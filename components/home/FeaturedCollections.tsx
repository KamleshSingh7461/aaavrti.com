'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface Collection {
    title: string;
    description: string;
    image: string;
    link: string;
    tag?: string;
}

const collections: Collection[] = [
    {
        title: 'Wedding Collection',
        description: 'Exquisite pieces for your special day',
        image: '/seed-images/lehenga.png',
        link: '/products?tag=wedding',
        tag: 'Premium'
    },
    {
        title: 'Festive Wear',
        description: 'Celebrate in style',
        image: '/seed-images/saree (2).png',
        link: '/products?tag=festive',
        tag: 'Trending'
    },
    {
        title: 'Bestsellers',
        description: 'Our most loved pieces',
        image: '/seed-images/women kurta (1).png',
        link: '/products?tag=bestseller'
    },
    {
        title: 'New Arrivals',
        description: 'Fresh from our artisans',
        image: '/seed-images/accessories.png',
        link: '/products?tag=new',
        tag: 'New'
    }
];

export function FeaturedCollections() {
    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className={cn("text-4xl md:text-5xl font-light mb-4", cormorant.className)}>
                        Curated Collections
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover our handpicked selections for every occasion
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {collections.map((collection, index) => (
                        <Link
                            key={index}
                            href={collection.link}
                            className="group relative overflow-hidden bg-secondary/20 border border-border hover:border-primary/40 transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Image */}
                                <Image
                                    src={collection.image}
                                    alt={collection.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />

                                {/* Tag */}
                                {collection.tag && (
                                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider z-20">
                                        {collection.tag}
                                    </div>
                                )}
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                                <h3 className={cn("text-2xl font-light mb-2 group-hover:text-primary transition-colors", cormorant.className)}>
                                    {collection.title}
                                </h3>
                                <p className="text-sm text-white/90 mb-3">
                                    {collection.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Explore</span>
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
