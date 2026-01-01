'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { unsubscribeNewsletter } from '@/actions/newsletter-actions';
import { Button } from '@/components/ui/button';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, MailQuestion } from 'lucide-react';
import Link from 'next/link';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleUnsubscribe = async () => {
        if (!email) return;
        setStatus('loading');
        try {
            const result = await unsubscribeNewsletter(email);
            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Unsubscribed successfully.');
            } else {
                setStatus('error');
                setMessage(result.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Failed to connect to the server.');
        }
    };

    if (!email) {
        return (
            <div className="text-center space-y-6 max-w-md mx-auto py-20 px-4">
                <MailQuestion className="w-16 h-16 text-muted-foreground mx-auto" />
                <h1 className={cn("text-3xl font-light", cormorant.className)}>Invalid Link</h1>
                <p className="text-muted-foreground">
                    We couldn't find an email address to unsubscribe. Please check the link in your email.
                </p>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/">Back to Store</Link>
                </Button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center space-y-6 max-w-md mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h1 className={cn("text-3xl font-light", cormorant.className)}>Success</h1>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-xs text-muted-foreground italic pt-4">
                    It may take up to 24 hours for our system to fully update.
                </p>
                <div className="space-y-3 pt-6">
                    <Button asChild className="w-full">
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center space-y-8 max-w-md mx-auto py-20 px-4 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h1 className={cn("text-4xl font-light", cormorant.className)}>Newsletter Preferences</h1>
                <p className="text-muted-foreground">
                    Are you sure you want to stop receiving updates for <span className="font-medium text-foreground">{email}</span>?
                </p>
            </div>

            <div className="p-6 bg-secondary/20 rounded-xl space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    By unsubscribing, you will miss out on:
                </p>
                <ul className="text-sm space-y-2 text-left list-disc list-inside px-4">
                    <li>Exclusive early access to new collections</li>
                    <li>Special discounts and heritage event invites</li>
                    <li>Authentic handloom stories and styling tips</li>
                </ul>
            </div>

            <div className="space-y-3 pt-4">
                <Button
                    onClick={handleUnsubscribe}
                    disabled={status === 'loading'}
                    className="w-full h-12 rounded-md transition-all hover:shadow-lg"
                    variant="destructive"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Yes, Unsubscribe Me'
                    )}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                    <Link href="/">I changed my mind, take me back</Link>
                </Button>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading preferences...</p>
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
        </div>
    );
}
