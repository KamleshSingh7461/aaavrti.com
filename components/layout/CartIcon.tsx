'use client';

import { useCart } from "@/lib/store";
import { ShoppingBag } from "lucide-react";

export function CartIcon() {
    const { toggleCart, items } = useCart();
    return (
        <button
            onClick={toggleCart}
            className="p-2 hover:bg-secondary/20 transition-colors text-foreground/70 hover:text-primary relative group"
        >
            <ShoppingBag className="h-5 w-5" />
            {items.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[11px] font-medium flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                    {items.length}
                </span>
            )}
        </button>
    )
}
