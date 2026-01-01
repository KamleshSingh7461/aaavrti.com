'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Tags, BarChart3, Tag, Palette, ClipboardList, Megaphone, Server, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/returns', label: 'Returns', icon: RotateCcw }, // Use different icon? e.g. RotateCcw if available, or duplicate.
    { href: '/admin/orders/abandoned', label: 'Abandoned', icon: ShoppingCart },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/inventory', label: 'Inventory', icon: ClipboardList },
    { href: '/admin/marketing/banners', label: 'Banners', icon: Megaphone },
    { href: '/admin/marketing/newsletter', label: 'Newsletter', icon: Megaphone }, // Use explicit icon if available, or duplicate match
    { href: '/admin/marketing/coupons', label: 'Marketing Coupons', icon: Tag },
    { href: '/admin/marketing/attribution', label: 'Attribution', icon: BarChart3 },
    { href: '/admin/attributes', label: 'Attributes', icon: Palette },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/system', label: 'System', icon: Server },
];

export function AdminSidebar({ className, onClose }: { className?: string, onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <aside className={cn("bg-card border-r border-border h-full flex flex-col", className)}>
            <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                <Link href="/">
                    <Image
                        src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png"
                        alt="Aaavrti"
                        width={160}
                        height={50}
                        className="object-contain"
                    />
                </Link>
                <span className="ml-2 font-serif text-lg font-bold text-primary">Admin</span>
                {onClose && (
                    <button onClick={onClose} className="ml-auto md:hidden">
                        <LogOut className="h-5 w-5 rotate-180" /> {/* Using LogOut as close for now or add X icon */}
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-1 shrink-0">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Back to Store
                </Link>
                <button
                    onClick={() => import('next-auth/react').then(mod => mod.signOut({ callbackUrl: '/' }))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </button>
            </div>
        </aside>
    );
}
