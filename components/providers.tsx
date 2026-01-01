'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { WishlistSync } from '@/components/account/WishlistSync';
import { Session } from 'next-auth';

export function Providers({
    children,
    session
}: {
    children: React.ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            {children}
            <WishlistSync />
            <Toaster />
        </SessionProvider>
    );
}
