'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin-portal/login' });
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md"
        >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
        </button>
    );
}
