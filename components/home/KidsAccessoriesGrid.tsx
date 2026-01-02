'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export function KidsAccessoriesGrid() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Kids Section */}
                    <Link href="/category/kids" className="group relative block overflow-hidden rounded-lg aspect-[4/5] md:aspect-[3/2]">
                        <Image
                            src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767375452/ChatGPT_Image_Jan_2_2026_11_07_19_PM_fljnmy.png"
                            alt="Kids Fashion"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <h3 className={cn("text-4xl md:text-5xl text-white mb-4 drop-shadow-md", cormorant.className)}>
                                The Little Royals
                            </h3>
                            <span className="inline-flex items-center text-white/90 uppercase tracking-widest text-sm font-medium border-b border-white/0 group-hover:border-white transition-all duration-300 pb-1">
                                Shop Kids
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </Link>

                    {/* Accessories Section */}
                    <Link href="/category/accessories" className="group relative block overflow-hidden rounded-lg aspect-[4/5] md:aspect-[3/2]">
                        <Image
                            src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767375572/ChatGPT_Image_Jan_2_2026_11_09_25_PM_k8s0pw.png"
                            alt="Fashion Accessories"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <h3 className={cn("text-4xl md:text-5xl text-white mb-4 drop-shadow-md", cormorant.className)}>
                                Finery & Adornments
                            </h3>
                            <span className="inline-flex items-center text-white/90 uppercase tracking-widest text-sm font-medium border-b border-white/0 group-hover:border-white transition-all duration-300 pb-1">
                                Shop Accessories
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
