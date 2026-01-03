'use client';

import { useEffect, useState } from 'react';
import { syncViewHistory, getViewHistory } from '@/actions/history-actions';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useSession } from 'next-auth/react';
import { FadeIn } from '@/components/ui/motion';
import { getProducts } from '@/actions/get-products';

interface RecentlyViewedProps {
    currentProductId?: string;
}

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
    const { data: session } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initHistory = async () => {
            // 1. Update LocalStorage with current product
            if (currentProductId) {
                const localHistory = JSON.parse(localStorage.getItem('viewed_products') || '[]');
                const newHistory = [currentProductId, ...localHistory.filter((id: string) => id !== currentProductId)].slice(0, 20);
                localStorage.setItem('viewed_products', JSON.stringify(newHistory));
            }

            // 2. Fetch history depending on Auth state
            if (session?.user) {
                // If Logged In: Sync & Fetch DB
                const localHistory = JSON.parse(localStorage.getItem('viewed_products') || '[]');
                if (localHistory.length > 0) {
                    await syncViewHistory(localHistory);
                }
                const dbHistory = await getViewHistory();
                setProducts(dbHistory);
            } else {
                // If Guest: Fetch details using LocalStorage IDs
                const localHistory = JSON.parse(localStorage.getItem('viewed_products') || '[]');
                console.log("RecentlyViewed: Found guest history IDs:", localHistory);
                if (localHistory.length > 0) {
                    try {
                        console.log("RecentlyViewed: Fetching for IDs:", localHistory);
                        const fetchedProducts = await getProducts({ ids: localHistory });
                        console.log("RecentlyViewed: Fetched products count:", fetchedProducts.length);

                        if (fetchedProducts.length === 0) {
                            console.warn("RecentlyViewed: IDs exist but no products returned. IDs might be invalid or deleted.");
                        }

                        // Re-order to match history order (as $in doesn't guarantee order)
                        const orderedProducts = localHistory
                            .map((id: string) => fetchedProducts.find((p: any) => p.id === id))
                            .filter(Boolean);

                        console.log("RecentlyViewed: Final ordered count:", orderedProducts.length);
                        setProducts(orderedProducts);
                    } catch (error) {
                        console.error("Failed to fetch guest history products", error);
                    }
                }
            }
            setLoading(false);
        };

        initHistory();
    }, [currentProductId, session]);

    if (loading || products.length === 0) {
        console.log("RecentlyViewed: Loading or empty.", { loading, count: products.length });
        return null;
    }

    // Filter out current product from display
    const filteredProducts = products.filter(p => p.id !== currentProductId).slice(0, 4);

    if (filteredProducts.length === 0) {
        console.log("RecentlyViewed: Filtered list empty.");
        // Only show this during debug or if we want to confirm it's mounted
        // return <div className="p-4 text-center border">Debug: No recently viewed items found.</div>;
        return null;
    }

    return (
        <FadeIn className="space-y-8 border-t border-border/50 pt-12 mt-12 mb-12">
            <h2 className="text-2xl font-serif">Recently Viewed</h2>
            <ProductGrid products={filteredProducts} />
        </FadeIn>
    );
}
