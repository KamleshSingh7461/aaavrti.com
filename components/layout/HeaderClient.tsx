'use client';
// Force rebuild 3
// Header Redesign: Left Logo, Center [Search, Nav], Right Icons

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { CartIcon } from '@/components/layout/CartIcon';
import { MobileNav } from '@/components/layout/MobileNav';
import { UserMenu } from '@/components/layout/UserMenu';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { SearchModal } from '@/components/search/SearchModal';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CategoryWithChildren } from '@/lib/types';
import { WishlistSync } from '@/components/wishlist/WishlistSync';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface HeaderProps {
    categories: CategoryWithChildren[];
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function HeaderClient({ categories, user }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const pathname = usePathname();
    const router = useRouter();
    const isHomepage = pathname === '/';

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Cmd/Ctrl + K to open search modal (keep purely as shortcut)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <WishlistSync />
            <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-primary/40 bg-background/95 backdrop-blur-xl text-foreground shadow-sm">
                <div className="w-full px-6 md:px-12 lg:px-16 h-auto py-3 md:py-4">

                    {/* --- Mobile View (Default) --- */}
                    <div className="flex md:hidden items-center justify-between h-16">
                        {/* Left: Logo */}
                        <Link href="/" className="relative h-12 w-48 shrink-0">
                            <Image
                                src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767743051/OURNIKA_logo_exact_upgfui.svg"
                                alt="Ournika"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </Link>

                        {/* Right: User & Hamburger */}
                        <div className="flex items-center space-x-3">
                            <UserMenu user={user} />
                            <MobileNav categories={categories} user={user} onSearchClick={() => setIsSearchOpen(true)} />
                        </div>
                    </div>

                    {/* --- Desktop View (New Layout) --- */}
                    <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full">

                        {/* Left: Large Logo */}
                        <div className="flex justify-start">
                            <Link href="/">
                                <Image
                                    src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767743051/OURNIKA_logo_exact_upgfui.svg"
                                    alt="Ournika"
                                    width={280}
                                    height={80}
                                    className="object-contain h-20 w-auto transition-transform hover:scale-105"
                                    style={{ width: 'auto' }}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Center: Search Box & Navigation Stack */}
                        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
                            {/* Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="w-full relative px-0">
                                <div className="relative group w-full max-w-2xl mx-auto transition-all duration-300 hover:max-w-3xl focus-within:max-w-3xl">
                                    <input
                                        type="text"
                                        placeholder="Search for sarees, kurtas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary/10 border border-primary/20 rounded-full py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:border-primary/60 focus:bg-background transition-all duration-500 ease-out placeholder:text-muted-foreground/60 font-light text-center focus:text-left shadow-sm hover:shadow-md focus:shadow-xl focus:scale-[1.01]"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-300"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none transition-opacity duration-300 opacity-0 group-focus-within:opacity-100">
                                        <Search className="h-4 w-4" />
                                    </div>
                                </div>
                            </form>

                            {/* Navigation */}
                            <CategoryNav categories={categories} />
                        </div>

                        {/* Right: Icons */}
                        <div className="flex items-center justify-end space-x-6">
                            <LanguageToggle />
                            <UserMenu user={user} />
                            <CartIcon />
                        </div>
                    </div>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
