
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
        }, 6000); // Slower, more majestic transition
        return () => clearInterval(timer);
    }, [banners.length]);

    const next = () => setCurrent((current + 1) % banners.length);
    const prev = () => setCurrent((current - 1 + banners.length) % banners.length);

    if (banners.length === 0) {
        return <div className="h-screen w-full bg-[#1a1a1a]" />;
    }

    return (
        <div className="relative h-[95vh] w-full overflow-hidden bg-[#0a0a0a]">
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }} // Smoother crossfade
                    className="absolute inset-0"
                >
                    {/* Ken Burns Effect Image container */}
                    <div className="relative h-full w-full overflow-hidden">
                        <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full w-full"
                        >
                            <picture>
                                {/* Mobile Image (Portrait) */}
                                {banners[current].mobileImage && (
                                    <source media="(max-width: 768px)" srcSet={encodeURI(banners[current].mobileImage)} />
                                )}
                                {/* Desktop Image (Landscape) */}
                                <img
                                    src={encodeURI(banners[current].image)}
                                    alt={banners[current].title}
                                    className="h-full w-full object-cover opacity-90"
                                />
                            </picture>
                        </motion.div>

                        {/* Cinematic Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" /> {/* Texture if available, else subtle */}

                        {/* Decorative Border Frame */}
                        <div className="absolute inset-4 sm:inset-8 border-[1px] border-white/20 pointer-events-none z-10 hidden md:block">
                            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]/60" />
                            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#D4AF37]/60" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#D4AF37]/60" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37]/60" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
                            <div className="max-w-5xl space-y-8">
                                {/* Subtitle with decorative lines */}
                                <div className="flex items-center justify-center gap-4 overflow-hidden">
                                    <motion.div
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-[1px] w-12 md:w-24 bg-[#D4AF37]"
                                    />
                                    <motion.span
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-sm md:text-base font-medium text-[#D4AF37] tracking-[0.2em] uppercase font-sans"
                                    >
                                        {banners[current].subtitle || "Exclusive Collection"}
                                    </motion.span>
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-[1px] w-12 md:w-24 bg-[#D4AF37]"
                                    />
                                </div>

                                {/* Main Title */}
                                <motion.h1
                                    initial={{ y: 30, opacity: 0, filter: "blur(10px)" }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                    transition={{ delay: 0.8, duration: 1 }}
                                    className="text-5xl md:text-7xl lg:text-9xl font-serif text-white font-light tracking-wide leading-[1.1] drop-shadow-2xl"
                                >
                                    {banners[current].title}
                                </motion.h1>

                                {/* CTA Button - Minimalist & Premium */}
                                {banners[current].link && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1.2 }}
                                        className="pt-8"
                                    >
                                        <Link
                                            href={banners[current].link!}
                                            className="group relative inline-flex items-center gap-3 px-8 py-4 overflow-hidden rounded-sm transition-all hover:bg-white/5 border border-white/30 hover:border-[#D4AF37]"
                                        >
                                            <span className="relative z-10 text-white group-hover:text-[#D4AF37] transition-colors duration-300 tracking-widest text-sm uppercase font-medium">
                                                {banners[current].ctaText || 'Discover Now'}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-white group-hover:text-[#D4AF37] transition-all duration-300 group-hover:translate-x-1" />

                                            {/* Button Hover Fill */}
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Elegant Navigation Controls */}
            {banners.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full border border-white/10 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-500 z-30 hidden md:block group">
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={next} className="absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-full border border-white/10 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-500 z-30 hidden md:block group">
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Progress Bar Indicators */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className="group relative py-4"
                            >
                                <div className={`h-[2px] w-12 transition-all duration-500 ${current === idx ? 'bg-[#D4AF37] w-16' : 'bg-white/30 group-hover:bg-white/60'
                                    }`} />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
