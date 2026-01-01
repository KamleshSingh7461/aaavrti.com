'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Settings, LogOut, User } from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

const navItems = [
    { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin }, // Need to create this page eventually
    { href: '/account/settings', label: 'Settings', icon: Settings }, // Need to create this page eventually
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    {/* User Brief */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Account</p>
                            <h2 className={cn("text-xl font-medium", cormorant.className)}>My Profile</h2>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-border">
                            <SignOutButton className="w-full justify-start px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-colors" />
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-background min-h-[500px] animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
}
