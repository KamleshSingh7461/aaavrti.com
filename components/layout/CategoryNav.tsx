'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryWithChildren, Product } from '@/lib/types';
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
                    <MegaMenuItem key={category.id} category={category} t={t} />
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

function MegaMenuItem({ category, t }: { category: CategoryWithChildren; t: any }) {
    // State to track which sub-category is hovered
    const [activeSubCategory, setActiveSubCategory] = React.useState<CategoryWithChildren | null>(null);

    // Determine which products to show: active sub-cat products OR parent featured products
    const displayedProducts = activeSubCategory?.featuredProducts?.length
        ? activeSubCategory.featuredProducts
        : category.featuredProducts;

    const displayedTitle = activeSubCategory
        ? t({ en: activeSubCategory.name_en, hi: activeSubCategory.name_hi })
        : "Trending Now";

    const viewAllLink = activeSubCategory
        ? `/category/${category.slug}/${activeSubCategory.slug}`
        : `/category/${category.slug}`;

    return (
        <div
            className="group relative"
            onMouseLeave={() => setActiveSubCategory(null)} // Reset on leave
        >
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

            {/* Mega Menu Dropdown */}
            {category.children.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 w-[800px]">
                    <div className="bg-background/95 backdrop-blur-xl border border-border/30 shadow-2xl rounded-xl overflow-hidden grid grid-cols-12 min-h-[300px]">
                        {/* Left: Sub-categories */}
                        <div className="col-span-4 py-8 px-6 border-r border-border/30 bg-background/50">
                            <h4 className={cn("text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-3", cormorant.className)}>
                                Explore {t({ en: category.name_en, hi: category.name_hi })}
                            </h4>
                            <div className="space-y-1">
                                {category.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/category/${category.slug}/${child.slug}`}
                                        className={cn("block px-3 py-2.5 text-base rounded-md transition-all duration-200",
                                            activeSubCategory?.id === child.id
                                                ? "text-primary bg-secondary/40 translate-x-1 font-medium"
                                                : "text-foreground/70 hover:text-primary hover:bg-secondary/30",
                                            cormorant.className
                                        )}
                                        onMouseEnter={() => setActiveSubCategory(child)}
                                    >
                                        <span suppressHydrationWarning>
                                            {t({ en: child.name_en, hi: child.name_hi })}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right: Featured Products / Highlight */}
                        <div className="col-span-8 p-8 bg-secondary/5 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className={cn("text-sm font-medium uppercase tracking-widest text-primary animate-in fade-in duration-300", cormorant.className)} key={displayedTitle}>
                                    {displayedTitle}
                                </h4>
                                <Link href={viewAllLink} className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                                    View All
                                </Link>
                            </div>

                            {/* Product Grid */}
                            <div className="flex-1">
                                {displayedProducts && displayedProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-2 duration-300" key={displayedTitle}>
                                        {displayedProducts.slice(0, 2).map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.slug}`}
                                                className="group/product block bg-background rounded-lg p-3 border border-border/20 hover:border-primary/30 transition-all hover:shadow-lg"
                                            >
                                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md mb-3 bg-secondary/20">
                                                    {product.images?.[0] && (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name_en}
                                                            fill
                                                            className="object-cover group-hover/product:scale-105 transition-transform duration-700 ease-out"
                                                            sizes="(max-width: 768px) 100vw, 200px"
                                                        />
                                                    )}
                                                </div>
                                                <div className="px-1">
                                                    <h5 className={cn("text-lg font-medium text-foreground group-hover/product:text-primary transition-colors line-clamp-1", cormorant.className)}>
                                                        {t({ en: product.name_en, hi: product.name_hi })}
                                                    </h5>
                                                    <p className="text-sm text-muted-foreground mt-1 font-sans">
                                                        ₹{product.price?.toLocaleString('en-IN') || '0'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border/20 rounded-xl bg-background/50">
                                        <span className="text-sm italic font-light">
                                            Discover our latest {displayedTitle} collection
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
