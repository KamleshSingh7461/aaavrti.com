'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const content = localStorage.getItem('cookie_consent');
        if (content === null) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        // Update Google Consent Mode
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }
        localStorage.setItem('cookie_consent', 'granted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        // Update Google Consent Mode (Explicitly deny or leave as default denied)
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
            });
        }
        localStorage.setItem('cookie_consent', 'denied');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-40 shadow-lg animate-in slide-in-from-bottom-5">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center md:text-left">
                    <p>
                        We use cookies to improve your experience and analyze traffic.
                        By clicking "Accept", you agree to our use of cookies as described in our{' '}
                        <Link href="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleDecline}>
                        Decline
                    </Button>
                    <Button size="sm" onClick={handleAccept}>
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
}
