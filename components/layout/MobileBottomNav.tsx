'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/store';
import { useWishlist } from '@/lib/wishlist';

export function MobileBottomNav() {
    const pathname = usePathname();
    const { items: cartItems, toggleCart } = useCart();
    const { items: wishlistItems } = useWishlist();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/products', label: 'Shop', icon: Grid },
        { label: 'Cart', icon: ShoppingBag, onClick: toggleCart, badge: cartItems.length, isMain: true },
        { href: '/account/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistItems.length },
        { href: '/account', label: 'Account', icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe pb-2">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item, idx) => {
                    const isActive = item.href ? (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) : false;
                    const Icon = item.icon;
                    const isCart = item.label === 'Cart';

                    const Content = (
                        <>
                            <div className={cn("relative", isCart && "bg-primary text-primary-foreground p-3 rounded-full -mt-8 shadow-lg border-4 border-background")}>
                                <Icon className={cn(
                                    "transition-transform duration-300",
                                    isCart ? "h-6 w-6" : "h-5 w-5",
                                    isActive && !isCart && "scale-110"
                                )} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className={cn(
                                        "absolute bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-background",
                                        isCart ? "-top-1 -right-1 h-5 w-5" : "-top-1.5 -right-1.5 h-4 w-4 bg-primary text-primary-foreground"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            {!isCart && <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>}
                            {isCart && <span className="text-[10px] font-bold tracking-tight mt-1 text-primary hidden">{item.label}</span>}
                        </>
                    );

                    if (item.onClick) {
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full transition-colors relative",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                                    isCart && "overflow-visible"
                                )}
                            >
                                {Content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={item.href!}
                            className={cn(
                                "flex flex-col items-center justify-center w-full transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {Content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
