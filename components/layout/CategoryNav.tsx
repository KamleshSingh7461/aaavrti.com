'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryWithChildren } from '@/lib/types';
import { useLanguage } from '@/lib/language';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface NavProps {
    categories: CategoryWithChildren[];
}

export function CategoryNav({ categories }: NavProps) {
    const { t } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
                {categories.map((category) => (
                    <div key={category.id} className="group relative">
                        <Link
                            href={`/category/${category.slug}`}
                            className={cn("flex items-center text-sm font-light text-foreground/80 hover:text-primary transition-colors py-2 uppercase tracking-widest", cormorant.className)}
                        >
                            <span suppressHydrationWarning>
                                {t({ en: category.name_en, hi: category.name_hi })}
                            </span>
                            {category.children.length > 0 && (
                                <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-y-0.5" />
                            )}
                        </Link>

                        {/* Dropdown */}
                        {category.children.length > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                                <div className="bg-background/95 backdrop-blur-xl border border-border/30 shadow-xl rounded-b-md overflow-hidden">
                                    <div className="py-2">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/category/${category.slug}/${child.slug}`}
                                                className={cn("block px-6 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-secondary/30 transition-colors", cormorant.className)}
                                            >
                                                <span suppressHydrationWarning>
                                                    {t({ en: child.name_en, hi: child.name_hi })}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-background/98 backdrop-blur-xl border-b border-border/30 shadow-2xl p-6 md:hidden flex flex-col space-y-6 animate-in slide-in-from-top-2 z-40">
                    {categories.map((category) => (
                        <div key={category.id} className="space-y-3">
                            <Link
                                href={`/category/${category.slug}`}
                                className={cn("block font-light text-xl text-primary", cormorant.className)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span suppressHydrationWarning>
                                    {t({ en: category.name_en, hi: category.name_hi })}
                                </span>
                            </Link>
                            {category.children.length > 0 && (
                                <div className="pl-4 border-l border-border/30 space-y-2">
                                    {category.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/category/${category.slug}/${child.slug}`}
                                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span suppressHydrationWarning>
                                                {t({ en: child.name_en, hi: child.name_hi })}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
