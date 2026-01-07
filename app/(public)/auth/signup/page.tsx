
'use client';

import { useState } from 'react';
import { registerWithOtp, sendOtp } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, User, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

const outfit = Outfit({ subsets: ['latin'] });

export default function SignupPage() {
    const [step, setStep] = useState<'details' | 'verify'>('details');
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Tracking phone but it's optional for MVP email flow, keeping for record
    const [otp, setOtp] = useState('');

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
            toast.error(res.error || 'Failed to send verification code.');
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await registerWithOtp({ email, name, otp });

        if (res.success) {
            toast.success('Account created successfully! Logging you in...');

            // Auto Login
            const loginRes = await signIn('credentials', {
                email,
                otp,
                redirect: false
            });

            if (loginRes?.error) {
                toast.error('Login failed. Please try signing in.');
                router.push('/auth/login');
            } else {
                router.push('/');
                router.refresh();
            }
        } else {
            setLoading(false);
            // @ts-ignore
            toast.error(res.error || 'Registration failed');
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
                            {step === 'details' ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p className="text-muted-foreground">
                            {step === 'details' ? 'Begin your journey with timeless heritage.' : `Enter the code sent to ${email}`}
                        </p>
                    </div>

                    <form onSubmit={step === 'details' ? handleSendOtp : handleVerifyAndRegister} className="space-y-5">
                        <div className="space-y-4">
                            {step === 'details' && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Your Name"
                                                required
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 'verify' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="otp" className="text-sm font-medium">Verification Code</label>
                                        <button
                                            type="button"
                                            onClick={() => setStep('details')}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Change Details?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            placeholder="123456"
                                            required
                                            maxLength={6}
                                            autoFocus
                                            className="flex h-12 w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
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
                                step === 'details' ? (
                                    <>Get Verification Code <ArrowRight className="ml-2 h-4 w-4" /></>
                                ) : (
                                    <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                                )
                            )}
                        </button>
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
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
                    alt="Heritage Fashion"
                />
                <div className="absolute bottom-10 left-10 p-10 z-10 text-white max-w-lg">
                    <h2 className={cn("text-5xl font-serif font-medium leading-tight", outfit.className)}>
                        Where Modern Style Meets Timeless Heritage
                    </h2>
                </div>
            </div>
        </div>
    );
}
