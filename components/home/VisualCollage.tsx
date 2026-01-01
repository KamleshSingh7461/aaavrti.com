"use client";

import { motion } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";
import Image from "next/image";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface CollageProps {
    type: "craft" | "lifestyle" | "details";
    images: string[];
    title?: string;
    subtitle?: string;
}

export function VisualCollage({ type, images, title, subtitle }: CollageProps) {
    if (type === "craft") {
        return (
            <section className="py-24 bg-[#0a0a0a] overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-12 gap-6 h-[700px]">
                        <div className="col-span-8 relative group overflow-hidden rounded-sm">
                            <img src={images[0]} alt="Craftmanship" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
                                <h3 className={cn("text-5xl text-white mb-2", cormorant.className)}>{title}</h3>
                                <p className="text-white/70 tracking-widest uppercase text-xs">{subtitle}</p>
                            </div>
                        </div>
                        <div className="col-span-4 flex flex-col gap-6">
                            <div className="flex-1 relative group overflow-hidden rounded-sm">
                                <img src={images[1]} alt="Detail 1" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            </div>
                            <div className="flex-1 relative group overflow-hidden rounded-sm">
                                <img src={images[2]} alt="Detail 2" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (type === "lifestyle") {
        return (
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
                        {images.slice(0, 4).map((src, i) => (
                            <div key={i} className={cn(
                                "relative group overflow-hidden rounded-sm",
                                i % 2 === 0 ? "h-full" : "h-[90%] self-center"
                            )}>
                                <img src={src} alt={`Lifestyle ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Default Masonry-like details
    return (
        <section className="py-24 bg-secondary/5 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {images.map((src, i) => (
                        <div key={i} className="relative group overflow-hidden rounded-sm break-inside-avoid">
                            <img src={src} alt={`Detail ${i}`} className="w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
