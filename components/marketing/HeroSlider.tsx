
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';


interface Banner {
    id: string;
    image: string;
    mobileImage?: string | null;
    title: string;
    subtitle?: string | null;
    link?: string | null;
    ctaText?: string | null;
}

export function HeroSlider({ banners }: { banners: Banner[] }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const next = () => setCurrent((current + 1) % banners.length);
    const prev = () => setCurrent((current - 1 + banners.length) % banners.length);

    if (banners.length === 0) {
        // Fallback Default Hero
        return (
            <div className="relative h-[80vh] min-h-[600px] w-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20" /> {/* Overlay */}
                <div className="relative z-10 text-center space-y-6 px-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white drop-shadow-lg">
                        Timeless Indian Elegance
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                        Discover handpicked sarees and ethnic wear that define grace.
                    </p>
                    <Link href="/products" className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-all">
                        Shop Collection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-background">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    <div className="relative h-full w-full">
                        {/* Image */}
                        <picture>
                            {/* Mobile Image (Portrait) */}
                            {banners[current].mobileImage && (
                                <source media="(max-width: 768px)" srcSet={encodeURI(banners[current].mobileImage)} />
                            )}
                            {/* Desktop Image (Landscape) */}
                            <img
                                src={encodeURI(banners[current].image)}
                                alt={banners[current].title}
                                className="h-full w-full object-cover"
                            />
                        </picture>
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                            <div className="max-w-4xl space-y-6">
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg md:text-xl font-medium text-white/90 tracking-widest uppercase"
                                >
                                    {banners[current].subtitle}
                                </motion.p>

                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-4xl md:text-6xl lg:text-8xl font-serif text-white leading-tight drop-shadow-xl"
                                >
                                    {banners[current].title}
                                </motion.h1>

                                {banners[current].link && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <Link
                                            href={banners[current].link!}
                                            className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            {banners[current].ctaText || 'Shop Now'}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {banners.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-20">
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-20">
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${current === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
