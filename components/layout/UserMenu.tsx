
'use client';

import { User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { handleSignOut } from '@/actions/auth-actions';
import { useState } from 'react';

interface UserMenuProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'ADMIN';
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (!isLoggedIn) {
            router.push('/auth/login');
        } else if (isAdmin) {
            router.push('/admin/dashboard');
        }
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                onClick={handleClick}
                className="p-2 hover:bg-secondary/20 transition-colors text-foreground/70 hover:text-primary hidden sm:block relative"
                title={isLoggedIn ? `Account (${user?.name})` : "Sign In"}
            >
                <UserIcon className="h-5 w-5" />
                {isLoggedIn && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-background"></span>
                )}
            </button>
            {isLoggedIn && isOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-[100]">
                    <div className="bg-background/98 backdrop-blur-xl border border-border/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-5 py-4 border-b border-border/30 text-sm font-medium">
                            {user?.name}
                            <div className="text-xs text-muted-foreground mt-1">{user?.email}</div>
                            {isAdmin && (
                                <div className="text-xs text-primary mt-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Administrator
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="block px-5 py-3 text-sm text-primary font-medium hover:bg-secondary/20 transition-colors border-b border-border/30"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin Dashboard
                                </div>
                            </Link>
                        )}
                        <Link
                            href="/account"
                            className="block px-5 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-secondary/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            My Dashboard
                        </Link>
                        <Link
                            href="/account/orders"
                            className="block px-5 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-secondary/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            My Orders
                        </Link>
                        <Link
                            href="/account/addresses"
                            className="block px-5 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-secondary/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Addresses
                        </Link>
                        <div
                            onClick={async () => {
                                setIsOpen(false);
                                await handleSignOut();
                            }}
                            className="w-full text-left block px-5 py-3 text-sm text-accent hover:text-red-600 hover:bg-secondary/20 transition-colors border-t border-border/30 cursor-pointer"
                        >
                            Sign Out
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
