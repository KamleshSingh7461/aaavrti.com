'use client';

import { useCart } from '@/lib/store';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import { CartOffers } from '@/components/cart/CartOffers';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRecommendedProducts } from '@/actions/cart-actions';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

// Interface update
// Interface update
interface RecommendedProduct {
    id: string;
    name_en: string;
    name_hi: string | null;
    slug: string;
    images: string[];
    price: number;
    compareAtPrice: number | null;
    category: {
        name_en: string;
    } | null;
}

interface CartPageClientProps {
    initialRecommendedProducts: RecommendedProduct[];
}

export function CartPageClient({ initialRecommendedProducts }: CartPageClientProps) {
    const cart = useCart();
    const router = useRouter();
    const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>(initialRecommendedProducts);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Fetch recommendations based on cart items
    useEffect(() => {
        async function fetchRecommendations() {
            if (cart.items.length === 0) return;

            setLoadingRecommendations(true);
            const cartItemIds = cart.items.map(item => item.id);
            const products = await getRecommendedProducts(cartItemIds, 8);
            setRecommendedProducts(products);
            setLoadingRecommendations(false);
        }

        fetchRecommendations();
    }, [cart.items]);

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground/20" />
                        <div>
                            <h1 className={cn("text-4xl font-light mb-4", cormorant.className)}>
                                Your Cart is Empty
                            </h1>
                            <p className="text-muted-foreground">
                                Discover our collection and add items to your cart
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-medium hover:bg-accent hover:text-accent-foreground transition-all uppercase tracking-wider"
                        >
                            Continue Shopping
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={cn("text-3xl md:text-5xl font-light mb-2", cormorant.className)}>
                        Shopping Cart
                    </h1>
                    <p className="text-muted-foreground">
                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {/* Promo Banner */}
                {cart.getTotal() < 2000 && (
                    <div className="bg-primary/10 border-l-4 border-primary p-4 mb-8">
                        <p className="text-sm">
                            <span className="font-medium text-primary">Almost there!</span> Add ₹{(2000 - cart.getTotal()).toLocaleString('en-IN')} more to get <span className="font-medium">FREE SHIPPING</span>
                        </p>
                    </div>
                )}

                {/* Savings Summary */}
                {cart.discountAmount > 0 && (
                    <div className="bg-accent/10 border border-accent/30 p-4 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent text-accent-foreground flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-accent">You're saving ₹{cart.discountAmount.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-muted-foreground">Coupon "{cart.couponCode}" applied</p>
                            </div>
                        </div>
                        <button
                            onClick={cart.removeCoupon}
                            className="text-xs text-accent hover:underline uppercase tracking-wider"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-secondary/20 border border-border p-6 flex gap-6 hover:border-primary/40 transition-all"
                            >
                                {/* Product Image */}
                                <div className="relative w-32 h-40 bg-secondary/30 flex-shrink-0">
                                    <Image
                                        src={item.images[0]}
                                        alt={item.name_en}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <Link
                                            href={`/product/${item.id}`}
                                            className={cn("text-xl font-light hover:text-primary transition-colors line-clamp-2", cormorant.className)}
                                        >
                                            {item.name_en}
                                        </Link>

                                        <p className="text-lg font-medium text-foreground mt-3">
                                            ₹{item.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-border">
                                            <button
                                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                                className="p-3 hover:bg-secondary transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-6 font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                                className="p-3 hover:bg-secondary transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => cart.removeItem(item.id)}
                                            className="text-sm text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                    <p className={cn("text-2xl font-light", cormorant.className)}>
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Recommended Products Section */}
                        <div className="mt-12 pt-12 border-t border-border">
                            <h2 className={cn("text-3xl font-light mb-6", cormorant.className)}>
                                You May Also Like
                            </h2>
                            {loadingRecommendations ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-secondary/20 border border-border p-4 animate-pulse">
                                            <div className="aspect-square bg-secondary/30 mb-3"></div>
                                            <div className="h-4 bg-secondary/30 mb-2"></div>
                                            <div className="h-3 bg-secondary/30 w-2/3"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : recommendedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {recommendedProducts.slice(0, 8).map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.slug}`}
                                            className="bg-secondary/20 border border-border hover:border-primary/40 transition-all group"
                                        >
                                            <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name_en}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <p className="text-xs text-muted-foreground mb-1">{product.category?.name_en || 'Product'}</p>
                                                <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                    {product.name_en}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-secondary/10 border border-dashed border-border">
                                    <p className="text-muted-foreground">No recommended products available at the moment</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-secondary/20 border border-border p-6 sticky top-24 space-y-6">
                            <h2 className={cn("text-2xl font-light border-b border-border pb-4", cormorant.className)}>
                                Order Summary
                            </h2>

                            {/* Offers */}
                            <CartOffers />

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-4">
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

                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>

                                <div className={cn("flex justify-between text-2xl font-light border-t border-border pt-4", cormorant.className)}>
                                    <span>Total</span>
                                    <span>₹{cart.getFinalTotal().toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-primary text-primary-foreground py-4 font-medium hover:bg-accent hover:text-accent-foreground transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-primary/10 flex items-center justify-center mb-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Secure Payment</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-primary/10 flex items-center justify-center mb-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Free Shipping</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-primary/10 flex items-center justify-center mb-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-muted-foreground">7-10 Days</p>
                                </div>
                            </div>

                            {/* Continue Shopping */}
                            <Link
                                href="/"
                                className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
