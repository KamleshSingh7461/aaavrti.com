'use client';

import { useCart } from '@/lib/store';
import { CreditCard, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RazorpayButton() {
    const { getTotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const total = getTotal();

    const handlePayment = async () => {
        setLoading(true);
        // Simulate Razorpay/Server interaction
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In real app: Open Razorpay Modal -> On Success -> Call API
        alert(`Payment of ₹${total.toLocaleString('en-IN')} successful (Mock)`);
        clearCart();
        setLoading(false);
        router.push('/');
    };

    return (
        <div className="space-y-4">
            <div className="bg-secondary/10 p-4 rounded-lg border border-border flex items-center gap-3">
                <div className="p-2 bg-white rounded-full"><Lock className="w-4 h-4 text-primary" /></div>
                <p className="text-xs text-muted-foreground">
                    Payments are secured by Razorpay. We do not store your card details.
                </p>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground h-14 rounded-lg font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{total.toLocaleString('en-IN')}
                    </>
                )}
            </button>
        </div>
    );
}
