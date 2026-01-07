import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from './types';

interface WishlistState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    setItems: (products: Product[]) => void;
}

export const useWishlist = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get();
                const existingItem = items.find((i) => i.id === product.id);
                if (!existingItem) {
                    set({ items: [...items, product] });
                }
            },
            removeItem: (productId) => {
                const { items } = get();
                set({ items: items.filter((i) => i.id !== productId) });
            },
            isInWishlist: (productId) => {
                const { items } = get();
                return items.some((i) => i.id === productId);
            },
            clearWishlist: () => set({ items: [] }),
            setItems: (products) => set({ items: products }),
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
