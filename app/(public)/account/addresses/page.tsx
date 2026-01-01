import { auth } from '@/auth';
import { getAddresses } from '@/actions/checkout-actions';
import { redirect } from 'next/navigation';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils'; // Keep this one for general utils
import { AddressList } from '@/components/account/AddressList';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
    title: 'My Addresses | Account',
    description: 'Manage your shipping addresses.'
};

export default async function AddressesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    const addresses = await getAddresses();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <h1 className={cn("text-3xl font-serif font-medium", cormorant.className)}>My Addresses</h1>
                <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    {addresses.length} Saved
                </span>
            </div>

            <AddressList initialAddresses={addresses} cormorantClassName={cormorant.className} />
        </div>
    );
}
