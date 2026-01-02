// Force rebuild 2
// Sync check at Jan 3 02:25 AM

import { useEffect, useState } from 'react';
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

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    {/* Mobile Menu */}
                    <MobileNav categories={categories} />

                    {/* Logo - Pushed Left on Mobile, Left/Center on Desktop */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image
                                src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png"
                                alt="Aaavrti"
                                width={200}
                                height={60}
                                className="object-contain max-h-14 w-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Navigation - Centered (Desktop Only) */}
                    <div className="hidden md:flex flex-1 px-12 justify-center">
                        <CategoryNav categories={categories} />
                    </div>

                    {/* Icons/Actions */}
                    <div className="flex items-center space-x-2 md:space-x-6">
                        {/* Desktop Only Icons */}
                        <div className="hidden md:flex items-center space-x-6">
                            <LanguageToggle />
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 hover:bg-secondary/30 transition-colors text-foreground/70 hover:text-primary"
                                title="Search (Ctrl+K)"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            <CartIcon />
                        </div>

                        {/* Profile/User Menu - Always Visible */}
                        <UserMenu user={user} />

                        {/* Mobile Search - Just an icon if needed, but we have bottom nav? */}
                        {/* Actually, the prompt said logo and profile button in top bar. */}
                    </div>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
