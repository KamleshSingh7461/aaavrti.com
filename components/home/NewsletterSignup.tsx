'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import { Mail, Check } from 'lucide-react';
import { subscribeNewsletter } from '@/actions/newsletter-actions';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const result = await subscribeNewsletter(email);
            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Thank you for subscribing!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(result.error || 'Something went wrong.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to subscribe. Please try again.');
        }
    };

    return (
        <section className="py-20 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>

                    {/* Heading */}
                    <h2 className={cn("text-3xl md:text-4xl font-light mb-4", cormorant.className)}>
                        Join Our Community
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Subscribe to get special offers, exclusive updates, and styling tips. Plus, get <span className="font-medium text-primary">10% off</span> your first order!
                    </p>

                    {/* Form */}
                    {status === 'success' ? (
                        <div className="bg-accent/10 border border-accent/30 p-6 flex items-center justify-center gap-3">
                            <Check className="w-5 h-5 text-accent" />
                            <p className="text-accent font-medium">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-6 py-4 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-8 py-4 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 uppercase tracking-wider text-sm font-medium whitespace-nowrap"
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    )}

                    {/* Privacy Note */}
                    <p className="text-xs text-muted-foreground mt-4">
                        We respect your privacy. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
    );
}
