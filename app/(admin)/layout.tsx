import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, Store, Palette, Boxes, Megaphone, Tag, Cog } from 'lucide-react';
import { LogoutButton } from '@/components/admin/LogoutButton';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Server-side protection
    if (!session?.user) {
        redirect('/admin-portal/login?callbackUrl=/admin/dashboard');
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar (Fixed) */}
            <AdminSidebar className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
                {/* Header (Sticky) */}
                <AdminHeader user={session.user} />

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
