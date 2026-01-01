'use client';

import { useEffect, useRef } from 'react';
import { useWishlist } from '@/lib/wishlist';
import { syncWishlist, getWishlist } from '@/actions/wishlist-actions';
import { Product } from '@/lib/types';
import { useSession } from 'next-auth/react';

export function WishlistSync() {
    const { data: session } = useSession();
    const { items, addItem } = useWishlist();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!session?.user || syncedRef.current) return;

        const sync = async () => {
            syncedRef.current = true; // Prevent double firing

            // 1. Sync Local -> DB
            const localIds = items.map(i => i.id);
            if (localIds.length > 0) {
                await syncWishlist(localIds);
            }

            // 2. Fetch Merged DB -> Local
            // We fetch the full product objects from DB
            const serverItems = await getWishlist();

            // clearWishlist(); // Optional: Clear and replace, or merge? 
            // Let's merge carefully. Actually simpler to just replace local with server truth after sync

            // Add server items that are missing locally (though we just synced up, so server should have all local + its own)
            // But strict replace might be cleaner to ensure consistency

            // Need to map prisma result to Product type. Server action returns Product[] mostly compatible.
            // We'll iterate and add.
            const serverProducts = serverItems as unknown as Product[];

            // Update store - we can just set items directly if we expose a setter, or loop addItem
            // To be safe and clean, let's just loop addItem (Zustand mimics dedupe)
            serverProducts.forEach(p => addItem(p));
        };

        sync();
    }, [session, items, addItem]);  // Safe dependencies

    return null;
}
