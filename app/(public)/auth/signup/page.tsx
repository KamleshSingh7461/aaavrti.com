
'use client';

import { useActionState, useEffect } from 'react';
import { registerUser } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, User, Mail, Lock, Phone } from 'lucide-react';
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
        <div className="min-h-screen flex text-foreground">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[500px] xl:w-[600px] bg-background">
                <div className="mx-auto w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

                    <div className="space-y-2">
                        <Link href="/" className={cn("text-2xl font-serif font-bold tracking-tighter", outfit.className)}>
                            AAAVRTI
                        </Link>
                        <h1 className={cn("text-4xl font-serif font-medium mt-6", outfit.className)}>Create Account</h1>
                        <p className="text-muted-foreground">Begin your journey with timeless heritage.</p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        required
                                        className="flex h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
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
                                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="+91 98765 43210"
                                        required
                                        className="flex h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
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
                            <SubmitButton />
                            {state === 'success' ? (
                                <p className="mt-4 text-sm text-green-600 text-center bg-green-50 p-3 rounded-md border border-green-100 animate-in fade-in">
                                    Account created! <Link href="/auth/login" className="underline font-medium">Sign In Now</Link>
                                </p>
                            ) : state && (
                                <p className="mt-4 text-sm text-red-500 text-center bg-red-50 p-3 rounded-md border border-red-100 animate-in fade-in">{state}</p>
                            )}
                        </div>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                            Sign in to your account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block relative flex-1 bg-muted">
                <div className="absolute inset-0 h-full w-full bg-zinc-900/10"></div>
                <img
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 transition-all duration-1000 hover:grayscale-0"
                    src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
                    alt="Heritage Fashion"
                />
                <div className="absolute bottom-10 left-10 p-10 z-10 text-white max-w-lg animate-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <p className="text-lg font-medium opacity-80 mb-2">The Collection</p>
                    <h2 className={cn("text-5xl font-serif font-medium leading-tight", outfit.className)}>
                        Where Modern Style Meets Timeless Heritage
                    </h2>
                </div>
            </div>
        </div>
    );
}
