import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';

export interface CartItem extends Product {
    quantity: number;
    productId?: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    discountAmount: number; // Absolute amount
    couponCode: string | null;

    addItem: (product: Product & { productId?: string }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;

    applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
    removeCoupon: () => void;

    // Computed (helper)
    getTotal: () => number;
    getFinalTotal: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            discountAmount: 0,
            couponCode: null,

            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true, // Open cart on add
                    });
                } else {
                    set({
                        items: [...currentItems, { ...product, quantity: 1 }],
                        isOpen: true,
                    });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) {
                    get().removeItem(id);
                    return;
                }

                set({
                    items: get().items.map(item =>
                        item.id === id ? { ...item, quantity } : item
                    )
                });
            },

            clearCart: () => set({ items: [] }),

            toggleCart: () => set({ isOpen: !get().isOpen }),

            applyCoupon: async (code) => {
                const { items } = get();

                // Prepare items for validation (map store items to validation format)
                const validationItems = items.map(item => ({
                    id: item.id,
                    productId: item.productId || item.id, // For variants vs products
                    price: item.price,
                    quantity: item.quantity
                }));

                try {
                    // Dynamic import to avoid server-side issues in store?
                    // Actually server actions can be imported securely.
                    const { validateCoupon } = await import('@/actions/offer-actions');
                    const result = await validateCoupon(code, validationItems);

                    if (result.success) {
                        set({
                            discountAmount: result.discountTotal,
                            couponCode: code.toUpperCase()
                        });
                        return { success: true };
                    } else {
                        // Return error for UI to handle
                        return { success: false, message: result.error };
                    }
                } catch (e) {
                    return { success: false, message: 'Failed to validate coupon' };
                }
            },

            removeCoupon: () => set({ discountAmount: 0, couponCode: null }),

            getTotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getFinalTotal: () => {
                const total = get().getTotal();
                return Math.max(0, total - get().discountAmount);
            }
        }),
        {
            name: 'aaavrti-cart-storage',
        }
    )
);
