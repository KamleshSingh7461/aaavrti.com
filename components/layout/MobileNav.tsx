'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 overflow-y-auto">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Browse categories and account links</SheetDescription>
                </SheetHeader>
                {/* Header */}
                <div className="p-6 border-b border-border/50">
                    <Link href="/" onClick={() => setIsOpen(false)} className="block w-32 relative h-10">
                        <Image
                            src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png"
                            alt="Aaavrti"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col py-4">
                    <Link
                        href="/new/arrival"
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-4 text-lg font-medium hover:bg-secondary/30 transition-colors flex items-center justify-between"
                    >
                        <span className={cormorant.className}>New Arrivals</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>

                    {mainCategories.map((category) => (
                        <div key={category.id} className="flex flex-col">
                            <Link
                                href={`/category/${category.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-4 text-lg font-medium hover:bg-secondary/30 transition-colors flex items-center justify-between border-t border-border/30"
                            >
                                <span className={cormorant.className}>{category.name_en}</span>
                                <ChevronRight className="h-4 w-4 opacity-50" />
                            </Link>
                            {/* Subcategories (Simple list for now) */}
                            {category.children && category.children.length > 0 && (
                                <div className="bg-secondary/10 px-6 py-2 pb-4 space-y-3">
                                    {category.children.slice(0, 5).map(child => (
                                        <Link
                                            key={child.id}
                                            href={`/category/${category.slug}/${child.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {child.name_en}
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/category/${category.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="block text-xs font-bold uppercase tracking-widest text-primary mt-2"
                                    >
                                        View All {category.name_en}
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}

                    <Link
                        href="/offers"
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-4 text-lg font-medium hover:bg-secondary/30 transition-colors flex items-center justify-between border-t border-border/30 text-rose-600"
                    >
                        <span className={cormorant.className}>Offers & Sale</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="mt-auto border-t border-border/50 p-6 bg-secondary/10">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {isLoggedIn ? (
                            <>
                                <Link href="/account" onClick={() => setIsOpen(false)}>My Account</Link>
                                <Link href="/account/orders" onClick={() => setIsOpen(false)}>Orders</Link>
                            </>
                        ) : (
                            <Link href="/auth/login" onClick={() => setIsOpen(false)}>Login / Register</Link>
                        )}
                        <Link href="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
                        <Link href="/faq" onClick={() => setIsOpen(false)}>FAQs</Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
