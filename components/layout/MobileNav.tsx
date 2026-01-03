'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from "@/lib/utils";
import { CategoryWithChildren } from "@/lib/types";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface MobileNavProps {
    categories: CategoryWithChildren[];
    user?: any;
}

export function MobileNav({ categories, user }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter top-level categories
    const mainCategories = categories.filter(c => c.slug !== 'new-arrival' && c.slug !== 'offers');

    const isLoggedIn = !!user;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col h-full max-h-[100dvh]">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Browse categories and account links</SheetDescription>
                </SheetHeader>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col p-6">
                    {/* Search Bar - Top */}
                    <div className="mb-8 relative">
                        <input
                            type="text"
                            placeholder="Search your fashion store"
                            className="w-full h-12 border-b border-black/20 text-lg placeholder:text-black/40 focus:outline-none focus:border-black transition-colors rounded-none bg-transparent"
                            onClick={() => {
                                // Optional: trigger search modal if we want full search UI, or just keep as simple input
                            }}
                        />
                        <Search className="absolute right-0 top-3 h-6 w-6 text-black/40" />
                    </div>

                    {/* Menu Items - Clean Text List */}
                    <div className="flex flex-col space-y-6">
                        <Link
                            href="/new/arrival"
                            onClick={() => setIsOpen(false)}
                            className={cn("text-2xl uppercase tracking-widest font-light text-black hover:opacity-60 transition-opacity", cormorant.className)}
                        >
                            New In
                        </Link>

                        {mainCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                onClick={() => setIsOpen(false)}
                                className={cn("text-2xl uppercase tracking-widest font-light text-black hover:opacity-60 transition-opacity", cormorant.className)}
                            >
                                {category.name_en}
                            </Link>
                        ))}

                        <Link
                            href="/offers"
                            onClick={() => setIsOpen(false)}
                            className={cn("text-2xl uppercase tracking-widest font-light text-rose-600 hover:opacity-60 transition-opacity", cormorant.className)}
                        >
                            Sale
                        </Link>
                    </div>

                    {/* Bottom Actions - Pinned to bottom of content or pushed down */}
                    <div className="mt-auto pt-12 space-y-4">
                        {isLoggedIn ? (
                            <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm uppercase tracking-wider font-medium opacity-70">
                                <User className="h-5 w-5" />
                                My Account
                            </Link>
                        ) : (
                            <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm uppercase tracking-wider font-medium opacity-70">
                                <User className="h-5 w-5" />
                                Log In
                            </Link>
                        )}
                        <div className="flex gap-6 pt-4 border-t border-black/10">
                            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-xs text-black/50">Contact</Link>
                            <Link href="/faq" onClick={() => setIsOpen(false)} className="text-xs text-black/50">FAQs</Link>
                            <Link href="/track-order" onClick={() => setIsOpen(false)} className="text-xs text-black/50">Track Order</Link>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}
