'use client';

import { useState } from 'react';
import { sendOtp } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

const outfit = Outfit({ subsets: ['latin'] });

export default function CustomerLoginPage() {
    const [mode, setMode] = useState<'otp' | 'password'>('otp');
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await sendOtp(email);
        setLoading(false);

        if (res.success) {
            setStep('verify');
            toast.success('Verification code sent to your email.');
        } else {
            toast.error(res.error || 'Failed to send OTP');
        }
    };

    const handleOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // We use client-side signIn for OTP flow to handle session update efficiently
        const res = await signIn('credentials', {
            email,
            otp,
            redirect: false,
        });

        if (res?.error) {
            setLoading(false);
            toast.error('Invalid OTP. Please try again.');
        } else {
            // Success
            router.push('/');
            router.refresh();
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setLoading(false);
        if (res?.error) {
            toast.error('Invalid credentials');
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row text-foreground bg-background h-screen">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[500px] xl:w-[600px] bg-background relative overflow-hidden">
                <div className="mx-auto w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 relative z-10">

                    <div className="space-y-2">
                        <Link href="/" className={cn("text-2xl font-serif font-bold tracking-tighter", outfit.className)}>
                            OURNIKA
                        </Link>
                        <h1 className={cn("text-4xl font-serif font-medium mt-6", outfit.className)}>
                            {mode === 'otp' ? 'Welcome Back' : 'Admin Login'}
                        </h1>
                        <p className="text-muted-foreground">
                            {mode === 'otp' ? 'Sign in with your email to access your account.' : 'Secure login for administrators.'}
                        </p>
                    </div>

                    {mode === 'otp' ? (
                        /* OTP LOGIN FLOW */
                        <form onSubmit={step === 'email' ? handleSendOtp : handleOtpLogin} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            disabled={step === 'verify'}
                                            className="flex h-12 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {step === 'verify' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="otp" className="text-sm font-medium leading-none">Verification Code</label>
                                            <button
                                                type="button"
                                                onClick={() => setStep('email')}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Change Email?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <KeyRound className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="otp"
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="123456"
                                                required
                                                maxLength={6}
                                                autoFocus
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono letter-spacing-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    step === 'email' ? 'Send Verification Code' : 'Secure Login'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* PASSWORD LOGIN FLOW */
                        <form onSubmit={handlePasswordLogin} className="space-y-5">
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="flex h-12 w-full rounded-lg border border-input bg-background px-10 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="flex h-12 w-full rounded-lg border border-input bg-background px-10 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                            </button>
                        </form>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                    </div>

                    <div className="text-center space-y-2">
                        <button
                            onClick={() => {
                                setMode(mode === 'otp' ? 'password' : 'otp');
                                setStep('email');
                                setOtp('');
                            }}
                            className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-2 w-full"
                        >
                            {mode === 'otp' ? (
                                <><ShieldCheck className="h-4 w-4" /> Login with Password (Admin)</>
                            ) : (
                                <><Mail className="h-4 w-4" /> Login with Email OTP</>
                            )}
                        </button>

                        {mode === 'otp' && (
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block relative flex-1 bg-muted">
                <div className="absolute inset-0 h-full w-full bg-zinc-900/10"></div>
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
                    alt="Fashion Editorial"
                />
                <div className="absolute bottom-10 left-10 p-10 z-10 text-white max-w-lg">
                    <h2 className={cn("text-5xl font-serif font-medium leading-tight", outfit.className)}>
                        {mode === 'otp' ? 'Secure, Password-free Access.' : 'Administration Panel'}
                    </h2>
                </div>
            </div>
        </div>
    );
}
