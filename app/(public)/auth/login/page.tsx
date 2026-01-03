'use client';

import { useActionState } from 'react';
import { authenticateCustomer } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { useFormStatus } from 'react-dom';

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
    const [loginError, loginAction] = useActionState(authenticateCustomer, undefined);

    return (
        <div className="min-h-screen flex text-foreground">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[500px] xl:w-[600px] bg-background">
                <div className="mx-auto w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

                    <div className="space-y-2">
                        <Link href="/" className={cn("text-2xl font-serif font-bold tracking-tighter", outfit.className)}>
                            AAAVRTI
                        </Link>
                        <h1 className={cn("text-4xl font-serif font-medium mt-6", outfit.className)}>Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to access your curated collection.</p>
                    </div>

                    <form action={loginAction} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        required
                                        className="flex h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Link href="#" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        minLength={6}
                                        className="flex h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <SubmitButton isSignUp={false} />
                            {loginError && (
                                <p className="mt-4 text-sm text-red-500 text-center bg-red-50 p-3 rounded-md border border-red-100 animate-in fade-in">{loginError}</p>
                            )}
                        </div>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block relative flex-1 bg-muted">
                <div className="absolute inset-0 h-full w-full bg-zinc-900/10"></div>
                <img
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 transition-all duration-1000 hover:grayscale-0"
                    src="https://images.unsplash.com/photo-1574291823908-16e75bd6d6db?q=80&w=2560&auto=format&fit=crop"
                    alt="Fashion Editorial"
                />
                <div className="absolute bottom-10 left-10 p-10 z-10 text-white max-w-lg animate-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <p className="text-lg font-medium opacity-80 mb-2">New Arrivals</p>
                    <h2 className={cn("text-5xl font-serif font-medium leading-tight", outfit.className)}>
                        Discover the Art of Elegant Dressing
                    </h2>
                </div>
            </div>
        </div>
    );
}
