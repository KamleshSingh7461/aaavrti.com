"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PremiumCollageProps {
    images: string[];
    className?: string;
}

export function PremiumCollage({ images, className }: PremiumCollageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax transforms for different layers
    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const y3 = useTransform(scrollYProgress, [0, 1], [150, -150]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={containerRef}
            className={cn("relative py-32 overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background", className)}
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                style={{ opacity }}
                className="container mx-auto px-6 relative z-10"
            >
                {/* Mobile: Horizontal Scroll | Desktop: Clean Grid */}

                {/* Mobile Layout - Horizontal Scroll */}
                <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                        {images.map((image, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 60 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="flex-shrink-0 w-[280px] snap-center"
                            >
                                <div className="relative h-[420px] overflow-hidden rounded-sm bg-secondary/5">
                                    <Image
                                        src={image}
                                        alt={`Fashion ${idx + 1}`}
                                        fill
                                        className="object-contain"
                                        sizes="280px"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Desktop Layout - Clean Grid */}
                <div className="hidden md:grid grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* Image 1 - Large Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="col-span-4"
                    >
                        <motion.div
                            style={{ y: y1 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            className="relative h-[600px] overflow-hidden rounded-sm bg-secondary/5"
                        >
                            <Image
                                src={images[0]}
                                alt="Premium Fashion Collection"
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                sizes="33vw"
                            />

                            {/* Decorative corner accent */}
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="absolute top-0 right-0 w-16 h-16 bg-primary/20 backdrop-blur-sm"
                                style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Images 2 & 3 - Stacked Center */}
                    <div className="col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.div
                                style={{ y: y2 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.6 }}
                                className="relative h-[290px] overflow-hidden rounded-sm bg-secondary/5"
                            >
                                <Image
                                    src={images[1]}
                                    alt="Elegant Design"
                                    fill
                                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                                    sizes="33vw"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.div
                                style={{ y: y3 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.6 }}
                                className="relative h-[290px] overflow-hidden rounded-sm bg-secondary/5"
                            >
                                <Image
                                    src={images[2]}
                                    alt="Luxury Fashion"
                                    fill
                                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                                    sizes="33vw"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Image 4 - Large Right */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="col-span-4"
                    >
                        <motion.div
                            style={{ y: y2, scale }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            className="relative h-[600px] overflow-hidden rounded-sm bg-secondary/5"
                        >
                            <Image
                                src={images[3]}
                                alt="Heritage Collection"
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                sizes="33vw"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Image 5 - Full Width Bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="col-span-12"
                    >
                        <motion.div
                            style={{ y: y1 }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.6 }}
                            className="relative h-[400px] overflow-hidden rounded-sm bg-secondary/5"
                        >
                            <Image
                                src={images[4]}
                                alt="Exquisite Craftsmanship"
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                sizes="100vw"
                            />

                            {/* Decorative corner accent */}
                            <motion.div
                                initial={{ scale: 0, rotate: 45 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="absolute bottom-0 left-0 w-16 h-16 bg-accent/20 backdrop-blur-sm"
                                style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
                            />
                        </motion.div>
                    </motion.div>

                </div>

                {/* Floating text overlay - Desktop only */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20 hidden md:block"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.6, 0.8, 0.6]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-6xl lg:text-8xl font-light text-white/10 tracking-wider"
                        style={{ fontFamily: "var(--font-serif)" }}
                    >
                        HERITAGE
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
