'use client';

import { useCart } from "@/lib/store";
import { Product } from "@/lib/types";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function AddToCartButton({ product, variantId, disabled, className, quantity = 1 }: { product: Product; variantId?: string; disabled?: boolean; className?: string; quantity?: number }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        addItem({ ...product, id: variantId || product.id, productId: product.id, quantity }); // Preserve productId for FK
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={cn("flex-1 bg-primary text-primary-foreground h-14 rounded-full font-medium hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed", className)}
        >
            {added ? "Added to Bag!" : disabled ? "Out of Stock" : "Add to Cart"}
        </button>
    );
}
