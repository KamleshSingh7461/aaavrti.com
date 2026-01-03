import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AccountLayoutClient from './layout-client';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/login');
    }

    return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
