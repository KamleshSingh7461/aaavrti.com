"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface FashionShowcaseProps {
    images: string[];
    className?: string;
}

export function FashionShowcase({ images, className }: FashionShowcaseProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
    const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={containerRef}
            className={cn("relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background", className)}
        >
            {/* Subtle background accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent/3 rounded-full blur-[100px]" />
            </div>

            <motion.div style={{ opacity }} className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className={cn("text-4xl md:text-6xl font-light text-foreground mb-4", cormorant.className)}>
                        Curated Collection
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-primary/40" />
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Handpicked Elegance</p>
                        <div className="h-px w-12 bg-primary/40" />
                    </div>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="max-w-7xl mx-auto">

                    {/* Mobile Layout - Asymmetric Grid */}
                    <div className="grid grid-cols-6 gap-3 md:hidden">
                        {/* Row 1: Large + Small */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="col-span-4 row-span-2"
                        >
                            <div className="relative h-[400px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[0]} alt="Fashion 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="66vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="col-span-2"
                        >
                            <div className="relative h-[195px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[1]} alt="Fashion 2" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="col-span-2"
                        >
                            <div className="relative h-[195px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[2]} alt="Fashion 3" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" />
                            </div>
                        </motion.div>

                        {/* Row 2: Two Medium */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="col-span-3"
                        >
                            <div className="relative h-[240px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[3]} alt="Fashion 4" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="50vw" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="col-span-3"
                        >
                            <div className="relative h-[240px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[4]} alt="Fashion 5" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="50vw" />
                            </div>
                        </motion.div>

                        {/* Row 3: Full Width */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="col-span-6"
                        >
                            <div className="relative h-[280px] overflow-hidden rounded-lg bg-secondary/10 group">
                                <Image src={images[5]} alt="Fashion 6" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="100vw" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Layout - Sophisticated Bento Grid */}
                    <div className="hidden md:grid grid-cols-12 gap-6">

                        {/* Left Column - Tall Feature */}
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="col-span-5 row-span-2"
                        >
                            <motion.div
                                style={{ y: y1 }}
                                className="relative h-full min-h-[700px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[0]}
                                    alt="Featured Collection"
                                    fill
                                    className="object-cover transition-all duration-700 group-hover:scale-105"
                                    sizes="42vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Floating badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full"
                                >
                                    <span className="text-xs uppercase tracking-wider font-semibold text-foreground">Featured</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Right Top - Two Images */}
                        <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="col-span-4"
                        >
                            <motion.div
                                style={{ y: y2 }}
                                className="relative h-[340px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[1]}
                                    alt="Collection 2"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="33vw"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="col-span-3"
                        >
                            <motion.div
                                style={{ y: y2 }}
                                className="relative h-[340px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[2]}
                                    alt="Collection 3"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="25vw"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Right Middle - Wide */}
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="col-span-7"
                        >
                            <motion.div
                                style={{ y: y1 }}
                                className="relative h-[340px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[3]}
                                    alt="Collection 4"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="58vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        </motion.div>

                        {/* Bottom Row - Two Images */}
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.25 }}
                            className="col-span-6"
                        >
                            <motion.div
                                style={{ y: y2 }}
                                className="relative h-[340px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[4]}
                                    alt="Collection 5"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="50vw"
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="col-span-6"
                        >
                            <motion.div
                                style={{ y: y1 }}
                                className="relative h-[340px] overflow-hidden rounded-lg bg-secondary/10 group"
                            >
                                <Image
                                    src={images[5]}
                                    alt="Collection 6"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        </motion.div>

                    </div>
                </div>
            </motion.div>
        </section>
    );
}
