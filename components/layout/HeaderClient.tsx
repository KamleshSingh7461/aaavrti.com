'use client';
// Force rebuild 2
// Sync check at Jan 3 02:25 AM

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { CartIcon } from '@/components/layout/CartIcon';
import { MobileNav } from '@/components/layout/MobileNav';
import { UserMenu } from '@/components/layout/UserMenu';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { SearchModal } from '@/components/search/SearchModal';
import { Search } from 'lucide-react';
import Link from 'next/link';
// Force Update
import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CategoryWithChildren } from '@/lib/types';

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
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    // Handle Cmd/Ctrl + K to open search
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

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/95 backdrop-blur-xl border-border/30 text-foreground shadow-sm">
                <div className="container mx-auto px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    {/* Left: Mobile Trigger (Mobile) + Navigation (Desktop) */}
                    <div className="flex items-center justify-start gap-6">
                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden">
                            <MobileNav categories={categories} user={user} />
                        </div>

                        {/* Desktop Navigation - Hidden on Mobile */}
                        <div className="hidden md:block">
                            <CategoryNav categories={categories} />
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex justify-center">
                        <Link href="/">
                            <Image
                                src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png"
                                alt="Aaavrti"
                                width={200}
                                height={60}
                                className="object-contain max-h-14 w-auto transition-all duration-300"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right: Icons/Actions */}
                    <div className="flex items-center justify-end space-x-3 md:space-x-6">
                        {/* Desktop Only: Search + Language */}
                        <div className="hidden md:flex items-center space-x-6">
                            <LanguageToggle />
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 transition-colors hover:text-primary text-foreground/70"
                                title="Search (Ctrl+K)"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Shared: User (Account) & Cart - Visible on Mobile & Desktop */}
                        <div className="flex items-center space-x-3 md:space-x-6">
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
