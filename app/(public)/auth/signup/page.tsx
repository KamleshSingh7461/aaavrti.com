
'use client';

import { useActionState, useEffect } from 'react';
import { registerUser } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const outfit = Outfit({ subsets: ['latin'] });

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
            {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </button>
    );
}

export default function SignupPage() {
    const [state, formAction] = useActionState(registerUser, undefined);
    // Redirect handled by server action
    // useEffect(() => { ... }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="text-center space-y-2">
                    <h1 className={cn("text-3xl font-serif font-medium", outfit.className)}>Create Account</h1>
                    <p className="text-muted-foreground">Join our community of heritage lovers.</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="+91 98765 43210"
                                required
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <SubmitButton />
                        {state === 'success' ? (
                            <p className="text-sm text-green-600 text-center">
                                Account created! <Link href="/auth/login" className="underline">Sign In Now</Link>
                            </p>
                        ) : state && (
                            <p className="text-sm text-red-500 text-center">{state}</p>
                        )}
                    </div>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
