'use client';

import { useActionState, useEffect, useState } from 'react';
import { verifyOtp, sendOtp } from '@/actions/auth-actions';
import { Outfit } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, ArrowRight, RefreshCw } from 'lucide-react';
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
                    Verify Account <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </button>
    );
}

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');

    // We wrap the verifyOtp action to simply return the state result
    const verifyAction = async (prevState: any, formData: FormData) => {
        const otp = formData.get('otp') as string;
        if (!email) return { success: false, message: 'Email missing.' };
        return await verifyOtp(email, otp);
    };

    const [state, formAction] = useActionState(verifyAction, undefined);
    const [resendStatus, setResendStatus] = useState<string | null>(null);

    useEffect(() => {
        if (state?.success) {
            router.push('/auth/login?verified=true');
        }
    }, [state, router]);

    const handleResend = async () => {
        if (!email) return;
        setResendStatus('Sending...');
        const res = await sendOtp(email);
        if (res.success) {
            setResendStatus('Code sent!');
        } else {
            setResendStatus(res.error || 'Failed to send');
        }
    };

    if (!email) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center text-red-500">
                Invalid Request: Email parameter missing.
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="text-center space-y-2">
                    <h1 className={cn("text-3xl font-serif font-medium", outfit.className)}>Verify Your Email</h1>
                    <p className="text-muted-foreground">
                        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium">OTP Code</label>
                            <input
                                id="otp"
                                type="text"
                                name="otp"
                                placeholder="123456"
                                required
                                maxLength={6}
                                className="flex h-12 w-full text-center text-2xl tracking-[0.5em] rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring uppercase"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <SubmitButton />
                        {state?.message && (
                            <p className={cn("text-sm text-center", state.success ? "text-green-600" : "text-red-500")}>
                                {state.message}
                            </p>
                        )}
                    </div>
                </form>

                <div className="text-center text-sm">
                    <button
                        onClick={handleResend}
                        disabled={resendStatus === 'Sending...'}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                    >
                        {resendStatus === 'Sending...' && <Loader2 className="h-3 w-3 animate-spin" />}
                        Resend Code
                    </button>
                    {resendStatus && resendStatus !== 'Sending...' && (
                        <p className="text-muted-foreground text-xs mt-1">{resendStatus}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
