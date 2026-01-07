'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlist } from '@/lib/wishlist';
import { getWishlist, syncWishlist } from '@/actions/wishlist-actions';

export function WishlistSync() {
    const { data: session } = useSession();
    const { items, setItems } = useWishlist();

    useEffect(() => {
        if (session?.user) {
            // 1. If we have local items, try to sync them to server FIRST
            const localIds = items.map(i => i.id);
            if (localIds.length > 0) {
                syncWishlist(localIds);
            }

            // 2. Fetch fresh data from server to overwrite local
            // We use a small delay or rely on the fact that syncWishlist revalidates path
            // But to be sure, we fetch directly.
            getWishlist().then((serverItems) => {
                if (serverItems && serverItems.length > 0) {
                    // @ts-ignore - mismatch in Product types potentially, but usually compatible
                    setItems(serverItems as any);
                }
            });
        }
    }, [session?.user?.id]); // Run only when user ID changes (login)

    return null;
}
