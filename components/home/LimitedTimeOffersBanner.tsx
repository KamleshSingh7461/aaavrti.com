"use client";

import Link from "next/link";
import { MoveRight, Clock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface Offer {
    title: string | null;
    description: string | null;
    endDate: Date | null;
    value: number; // Converted from Decimal
    type: string;
}

export function LimitedTimeOffersBanner({ offer }: { offer?: Offer | null }) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (!offer?.endDate) return;

        const calculateTimeLeft = () => {
            const difference = new Date(offer.endDate!).getTime() - new Date().getTime();
            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60))), // Total hours left
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [offer]);

    if (!offer) return null;

    return (
        <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden relative border-y border-white/5">
            {/* Elegant Background Accents - Gold & Crimson */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#8B1538]/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Content & Timer */}
                    <div className="space-y-10 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full backdrop-blur-sm self-center lg:self-start">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Limited Event</span>
                            </div>

                            <h2 className={cn("text-5xl md:text-7xl font-light leading-tight", cormorant.className)}>
                                {offer.title || "The Royal Heritage Sale"}
                            </h2>

                            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {offer.description || "Experience the grandeur of handwoven silk at unprecedented prices."}
                            </p>
                        </div>

                        {/* Countdown Timer - Re-styled for Luxury */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                            {[
                                { label: 'Hours', value: timeLeft.hours },
                                { label: 'Mins', value: timeLeft.minutes },
                                { label: 'Secs', value: timeLeft.seconds }
                            ].map((unit, idx) => (
                                <div key={idx} className="flex flex-col items-center group">
                                    <div className="w-20 h-24 bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-sm flex items-center justify-center relative overflow-hidden group-hover:border-[#8B1538]/40 transition-colors">
                                        <span className={cn("text-4xl md:text-5xl font-light", cormorant.className)}>
                                            {String(unit.value).padStart(2, '0')}
                                        </span>
                                        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-[#8B1538] to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    </div>
                                    <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: CTA Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#8B1538]/15 to-primary/20 blur-[80px] -z-10 animate-pulse" />

                        <div className="bg-[#121212] border border-white/10 p-10 md:p-12 rounded-sm shadow-2xl relative overflow-hidden group hover:border-[#8B1538]/30 transition-colors duration-500">
                            {/* Decorative Corners - Gold & Crimson */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent transform translate-x-12 -translate-y-12 rotate-45" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#8B1538]/15 to-transparent transform -translate-x-16 translate-y-16 rotate-45" />

                            <div className="space-y-10">
                                <div className="space-y-4 text-center">
                                    <h3 className={cn("text-3xl md:text-4xl font-light italic", cormorant.className)}>
                                        {offer.type === 'PERCENTAGE' ? `Flat ${offer.value}% Off` : `Exclusive Saving`}
                                    </h3>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary to-[#8B1538]/60" />
                                        <span className="text-primary tracking-[0.3em] text-[10px] uppercase font-semibold">Exclusives</span>
                                        <div className="h-px w-8 bg-gradient-to-l from-transparent via-primary to-[#8B1538]/60" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Link
                                        href="/products"
                                        className="group relative flex items-center justify-center w-full py-5 bg-primary text-primary-foreground overflow-hidden transition-all duration-300 hover:tracking-[0.2em] uppercase text-xs font-bold tracking-widest"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            Shop The Sale
                                            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
                                    </Link>

                                    <p className="text-[10px] text-center text-muted-foreground/60 italic tracking-wider">
                                        *Terms and conditions apply. Limited stock available.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
