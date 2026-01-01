'use client';

import { useCart } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import { useToast } from '@/hooks/use-toast';
import { CartOffers } from './CartOffers';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

const FREE_SHIPPING_THRESHOLD = 2000; // ₹2000

export function CartDrawer() {
    const cart = useCart();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!cart.isOpen) return null;

    const total = cart.getTotal();
    const remaining = FREE_SHIPPING_THRESHOLD - total;
    const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={cart.toggleCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 border-l border-border/30">

                {/* Header */}
                <div className="p-6 border-b border-border/30 flex items-center justify-between bg-secondary/10">
                    <h2 className={cn("text-2xl font-light flex items-center gap-3", cormorant.className)}>
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        Your Bag
                        <span className="text-lg text-muted-foreground">({cart.items.length})</span>
                    </h2>
                    <button
                        onClick={cart.toggleCart}
                        className="p-2 hover:bg-secondary/20 transition-colors text-foreground/70 hover:text-primary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                {cart.items.length > 0 && (
                    <div className="px-6 py-4 bg-secondary/5 border-b border-border/30">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center gap-2 text-foreground/70">
                                <Truck className="w-4 h-4" />
                                <span>
                                    {remaining > 0
                                        ? `₹${remaining.toLocaleString('en-IN')} away from free shipping`
                                        : 'You qualify for free shipping! 🎉'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-secondary/30 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-muted-foreground">
                            <ShoppingBag className="w-20 h-20 opacity-10" />
                            <div>
                                <p className={cn("text-xl mb-2", cormorant.className)}>Your bag is empty</p>
                                <p className="text-sm">Add items to get started</p>
                            </div>
                            <button
                                onClick={cart.toggleCart}
                                className="text-primary font-medium hover:underline text-sm uppercase tracking-wider"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <div className="relative w-24 h-28 bg-secondary/10 overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.images[0]}
                                        alt={item.name_en}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className={cn("font-light text-foreground line-clamp-2 text-lg", cormorant.className)}>{item.name_en}</h3>
                                        <p className="text-sm text-accent font-medium mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center border border-border/30 overflow-hidden">
                                            <button
                                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-secondary/20 hover:text-primary transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-secondary/20 hover:text-primary transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => cart.removeItem(item.id)}
                                            className="text-xs text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                    <div className="p-6 border-t border-border/30 bg-secondary/5 space-y-5">

                        {/* Offers Selection */}
                        <CartOffers compact />

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between text-base">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">₹{cart.getTotal().toLocaleString('en-IN')}</span>
                            </div>

                            {cart.discountAmount > 0 && (
                                <div className="flex justify-between text-base text-primary">
                                    <span>Discount</span>
                                    <span className="font-medium">-₹{cart.discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}

                            <div className={cn("flex justify-between text-xl font-light border-t border-border/30 pt-3", cormorant.className)}>
                                <span>Total</span>
                                <span>₹{cart.getFinalTotal().toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                        </div>
                        <Link
                            href="/cart"
                            onClick={cart.toggleCart}
                            className="block w-full border-2 border-primary text-primary text-center py-4 font-medium hover:bg-primary/10 transition-all uppercase tracking-widest text-sm"
                        >
                            View Full Cart
                        </Link>
                        <Link
                            href="/checkout"
                            onClick={cart.toggleCart}
                            className="block w-full bg-primary text-primary-foreground text-center py-4 font-medium shadow-lg shadow-primary/20 hover:bg-accent transition-all active:scale-[0.99] uppercase tracking-widest text-sm"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
