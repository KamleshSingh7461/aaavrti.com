'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic']
});

interface LookbookProps {
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    link: string;
    align?: 'left' | 'right' | 'center';
}

export function LookbookSection({ title, subtitle, description, image, link, align = 'center' }: LookbookProps) {
    return (
        <section className="relative w-full h-[80vh] md:h-screen overflow-hidden group">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-700" />
            </div>

            {/* Content Content - Alignment logic */}
            <div className={cn(
                "absolute inset-0 flex flex-col justify-center p-8 md:p-20 text-white z-10",
                align === 'left' && "items-start text-left",
                align === 'right' && "items-end text-right",
                align === 'center' && "items-center text-center"
            )}>
                <div className="max-w-2xl space-y-6 mix-blend-difference">
                    {subtitle && (
                        <p className="text-sm tracking-[0.3em] uppercase opacity-90 font-medium">
                            {subtitle}
                        </p>
                    )}

                    <h2 className={cn(
                        "text-5xl md:text-8xl italic font-light leading-none",
                        cormorant.className
                    )}>
                        {title}
                    </h2>

                    {description && (
                        <p className="text-lg md:text-xl font-light opacity-90 leading-relaxed max-w-lg">
                            {description}
                        </p>
                    )}

                    <div className="pt-8">
                        <Link
                            href={link}
                            className="inline-flex items-center gap-3 text-lg uppercase tracking-widest group/btn"
                        >
                            <span className="border-b border-white pb-1 group-hover/btn:border-transparent transition-all">
                                Shop Collection
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
