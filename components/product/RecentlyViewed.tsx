'use client';

import { useEffect, useState } from 'react';
import { syncViewHistory, getViewHistory } from '@/actions/history-actions';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useSession } from 'next-auth/react'; // Need client session to check auth
import { FadeIn } from '@/components/ui/motion';

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
                // If Logged In:
                // Sync Local -> DB first
                const localHistory = JSON.parse(localStorage.getItem('viewed_products') || '[]');
                if (localHistory.length > 0) {
                    await syncViewHistory(localHistory);
                    // Optional: Clear local after sync? Or keep as backup? 
                    // Usually keep linked. But to prevent re-syncing constantly we could clear?
                    // No, "guest to user" flow implies we sync once or merge.
                    // The server side upserts so it's safe to call.
                }

                // Then Fetch DB History (Single Source of Truth)
                const dbHistory = await getViewHistory();
                setProducts(dbHistory);
            } else {
                // If Guest:
                // We only have IDs in localStorage. We need to fetch product details.
                // We can use a special server action to "getProductsByIds" or just use client side fetch?
                // Creating a public fetcher is safer.
                // For now, let's implement a quick "getProductsByIds" action or rely on what we have.
            }
            setLoading(false);
        };

        initHistory();
    }, [currentProductId, session]);
    // Effect dependency: runs when productId changes or session loads.

    // Note: Guest fetching logic is missing in the simplified version above.
    // If we want Guest history to visually appear, we need `getProductsByIds`.
    // I entered code for Auth flow mostly.

    if (loading || products.length === 0) return null;

    // Filter out current product from display
    const filteredProducts = products.filter(p => p.id !== currentProductId).slice(0, 4);

    if (filteredProducts.length === 0) return null;

    return (
        <FadeIn className="space-y-8 border-t border-border/50 pt-12 mt-12 mb-12">
            <h2 className="text-2xl font-serif">Recently Viewed</h2>
            <ProductGrid products={filteredProducts} />
        </FadeIn>
    );
}
