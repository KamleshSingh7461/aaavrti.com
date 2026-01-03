'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic']
});

interface Banner {
    id: string;
    image: string;
    mobileImage?: string | null;
    title: string;
    subtitle?: string | null;
    link?: string | null;
    ctaText?: string | null;
}

export function EditorialHero({ banners }: { banners: Banner[] }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) return null;

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black text-white">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="relative h-full w-full">
                        <picture>
                            {banners[current].mobileImage && (
                                <source media="(max-width: 768px)" srcSet={encodeURI(banners[current].mobileImage)} />
                            )}
                            <img
                                src={encodeURI(banners[current].image)}
                                alt={banners[current].title}
                                className="h-full w-full object-cover opacity-80"
                            />
                        </picture>
                        <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for text readability */}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
                        <div className="max-w-6xl space-y-6">
                            {/* Subtitle */}
                            {banners[current].subtitle && (
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-sm md:text-base tracking-[0.3em] uppercase font-light"
                                >
                                    {banners[current].subtitle}
                                </motion.p>
                            )}

                            {/* Massive Title */}
                            <motion.h1
                                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className={cn(
                                    "text-6xl md:text-8xl lg:text-[8rem] leading-[0.9] text-white italic font-medium mix-blend-overlay",
                                    cormorant.className
                                )}
                            >
                                {banners[current].title}
                            </motion.h1>

                            {/* CTA */}
                            {banners[current].link && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="pt-8"
                                >
                                    <Link
                                        href={banners[current].link!}
                                        className="inline-flex items-center gap-2 text-lg uppercase tracking-widest border-b border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-colors"
                                    >
                                        {banners[current].ctaText || 'Explore Collection'}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress/Indicators - Minimalist lines at bottom */}
            {banners.length > 1 && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-20">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-[2px] transition-all duration-300 ${current === idx ? 'w-12 bg-white' : 'w-4 bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
