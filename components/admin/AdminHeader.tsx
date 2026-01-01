
'use client';

import { Bell, Search, User, Menu, LogOut, Settings, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AdminSidebar } from './AdminSidebar';

export function AdminHeader({ user }: { user?: any }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ... notifications state
    const [mockNotifications, setMockNotifications] = useState([
        { id: 1, title: 'New Order Received', desc: 'Order #ORD-7830 - ₹4,500', time: 'Just now', type: 'order', read: false },
        { id: 2, title: 'Low Stock Alert', desc: 'Banarasi Silk Saree (Red) is below 5 items.', time: '1 hour ago', type: 'alert', read: false },
        { id: 3, title: 'Refund Requested', desc: 'Order #ORD-7812 requested a return.', time: '3 hours ago', type: 'warning', read: true },
    ]);

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    const markAsRead = () => {
        setMockNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="h-16 bg-background border-b border-border sticky top-0 z-30 px-6 flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden mr-4 p-2 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="relative max-w-md hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Global Search (Orders, Products...)"
                    className="pl-9 w-64 lg:w-96 bg-secondary/50 border border-transparent hover:border-border focus:border-primary rounded-md px-3 py-2 text-sm focus:outline-none transition-all"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors relative"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 border-b border-border flex items-center justify-between">
                                    <span className="font-semibold text-sm">Notifications</span>
                                    <button onClick={markAsRead} className="text-xs text-primary hover:underline">Mark all read</button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {mockNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground">No new notifications</div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {mockNotifications.map(n => (
                                                <div key={n.id} className={`p-3 hover:bg-secondary/50 transition-colors flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                                        n.type === 'alert' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                        {n.type === 'order' ? <ShoppingCart className="h-4 w-4" /> :
                                                            n.type === 'alert' ? <Package className="h-4 w-4" /> :
                                                                <Bell className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{n.title}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-2">{n.desc}</div>
                                                        <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Link href="/admin/notifications" className="block p-2 text-center text-xs font-medium bg-secondary/50 hover:bg-secondary border-t border-border transition-colors">
                                    View All Activity
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{user?.name || 'Admin User'}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || 'Store Manager'}</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar Drawer */}
                    <div className="absolute left-0 top-0 h-full w-72 animate-in slide-in-from-left duration-300">
                        <AdminSidebar
                            className="bg-background h-full shadow-2xl"
                            onClose={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
