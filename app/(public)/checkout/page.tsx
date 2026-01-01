import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAddresses } from '@/actions/checkout-actions';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export default async function CheckoutPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/login?callbackUrl=/checkout');
    }

    const addresses = await getAddresses();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                <h1 className={cn("text-3xl md:text-4xl font-light mb-8", cormorant.className)}>Checkout</h1>
                <CheckoutForm initialAddresses={addresses || []} user={session.user} />
            </div>
        </div>
    );
}
