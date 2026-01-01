'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlist } from '@/lib/wishlist';
import { getWishlist, syncWishlist } from '@/actions/wishlist-actions';

/**
 * WishlistSync component
 * 
 * Handles synchronization between local storage (Zustand) and server-side database.
 * 1. On login: Merges local wishlist to server.
 * 2. On load: Fetches server wishlist and populates local store if it's missing items.
 */
export function WishlistSync() {
    const { data: session } = useSession();
    const { items, addItem } = useWishlist();

    useEffect(() => {
        const sync = async () => {
            if (!session?.user?.id) return;

            try {
                // 1. Sync local to server
                if (items.length > 0) {
                    const localIds = items.map(i => i.id);
                    await syncWishlist(localIds);
                }

                // 2. Fetch server items to local (covers new device / other session)
                const serverItems = await getWishlist();

                // Add any missing items to local store
                serverItems.forEach((serverItem: any) => {
                    const exists = items.some(localItem => localItem.id === serverItem.id);
                    if (!exists) {
                        addItem(serverItem);
                    }
                });
            } catch (err) {
                console.error("Wishlist sync failed:", err);
            }
        };

        sync();
        // Specifically depend on session ID change (login/logout)
    }, [session?.user?.id]);

    return null; // Side-effect only component
}
