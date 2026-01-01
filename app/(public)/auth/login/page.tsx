'use client';

import { useActionState } from 'react';
import { authenticateCustomer, registerUser } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

const outfit = Outfit({ subsets: ['latin'] });

function SubmitButton({ isSignUp }: { isSignUp: boolean }) {
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
                    {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </button>
    );
}

export default function CustomerLoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loginError, loginAction] = useActionState(authenticateCustomer, undefined);
    const [signupError, signupAction] = useActionState(registerUser, undefined);

    const errorMessage = isSignUp ? signupError : loginError;
    const formAction = isSignUp ? signupAction : loginAction;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="text-center space-y-2">
                    <h1 className={cn("text-3xl font-serif font-medium", outfit.className)}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignUp ? 'Join us to access your curated collection.' : 'Sign in to access your curated collection.'}
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    required
                                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                {!isSignUp && (
                                    <Link href="#" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {isSignUp && (
                                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <SubmitButton isSignUp={isSignUp} />
                        {errorMessage && errorMessage !== 'success' && (
                            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                        )}
                        {errorMessage === 'success' && (
                            <p className="text-sm text-green-500 text-center">Account created! Please sign in.</p>
                        )}
                    </div>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary hover:underline font-medium"
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
