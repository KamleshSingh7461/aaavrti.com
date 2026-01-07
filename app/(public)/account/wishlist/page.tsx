'use client';

import { useWishlist } from '@/lib/wishlist';
import { ProductGrid } from '@/components/product/ProductGrid';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getWishlist } from '@/actions/wishlist-actions';

export default function WishlistPage() {
    const { items, setItems } = useWishlist();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Always fetch fresh data on this page to guarantee accuracy
        getWishlist().then((serverItems) => {
            if (serverItems) setItems(serverItems as any);
        });
    }, [setItems]);

    if (!mounted) return null;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-serif text-foreground">My Wishlist</h1>
                <span className="text-muted-foreground text-lg ml-2">({items.length})</span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-lg">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-6">Explore our collection and add your favorite items.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <ProductGrid products={items} />
            )}
        </div>
    );
}
