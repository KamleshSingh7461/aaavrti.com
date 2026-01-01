'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { toggleWishlist } from '@/actions/wishlist-actions';
import { toast } from 'sonner';

interface WishlistButtonProps {
    product: Product;
    className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
    const { addItem, removeItem } = useWishlist();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    // Hydration fix
    useEffect(() => {
        setMounted(true);
    }, []);

    const InWishlist = useWishlist((state) => state.isInWishlist(product.id));

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic Update
        if (InWishlist) {
            removeItem(product.id);
            toast.success("Removed from wishlist");
        } else {
            addItem(product);
            toast.success("Added to wishlist");
        }

        // Server Sync
        if (session?.user) {
            await toggleWishlist(product.id);
        }
    };

    if (!mounted) {
        return (
            <button className={cn("rounded-full bg-white/80 p-2 backdrop-blur-sm transition-transform hover:scale-110", className)}>
                <Heart className="h-5 w-5 text-gray-600" />
            </button>
        )
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "rounded-full p-2 transition-all hover:scale-110 active:scale-95 group",
                InWishlist
                    ? "bg-red-50 text-red-500"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-50 hover:text-red-500",
                className
            )}
            title={InWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
            <Heart className={cn("h-5 w-5 transition-colors", InWishlist && "fill-current")} />
        </button>
    );
}
