
'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface SignOutButtonProps {
    className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-fit",
                className
            )}
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </button>
    );
}
