'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { searchProducts } from '@/actions/search-products';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import { useLanguage } from '@/lib/language';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const products = await searchProducts(searchQuery);
            setResults(products);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-background shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 border border-border/30 max-h-[80vh] flex flex-col">
                {/* Search Input */}
                <div className="p-6 border-b border-border/30 flex items-center gap-4">
                    <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-lg focus:outline-none placeholder:text-muted-foreground"
                        autoFocus
                    />
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary/20 transition-colors text-foreground/70 hover:text-primary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {query.trim().length < 2 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className={cn("text-xl mb-2", cormorant.className)}>Start typing to search</p>
                            <p className="text-sm">Search by product name or description</p>
                        </div>
                    ) : results.length === 0 && !isLoading ? (
                        <div className="text-center text-muted-foreground py-12">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className={cn("text-xl mb-2", cormorant.className)}>No products found</p>
                            <p className="text-sm">Try different keywords</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.slug}`}
                                    onClick={onClose}
                                    className="flex gap-4 p-4 hover:bg-secondary/10 transition-colors border border-border/20 group"
                                >
                                    <div className="relative w-20 h-24 bg-secondary/10 flex-shrink-0 overflow-hidden">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name_en}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={cn("text-lg font-light text-foreground group-hover:text-primary transition-colors line-clamp-2", cormorant.className)}>
                                            {t({ en: product.name_en, hi: product.name_hi })}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {t({ en: product.description_en, hi: product.description_hi })}
                                        </p>
                                        <p className="text-accent font-medium mt-2">₹{product.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
