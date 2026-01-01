'use client';

import { useActionState } from 'react';
import { authenticateAdmin } from '@/actions/auth-actions';
import Link from 'next/link';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 inline-flex items-center justify-center bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
            {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </button>
    );
}

export default function AdminPortalLoginPage() {
    const [errorMessage, formAction] = useActionState(authenticateAdmin, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/10">
            <div className="w-full max-w-md space-y-8 p-8 bg-background border border-border/30 shadow-xl">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">Admin Portal</h1>
                    <p className="text-muted-foreground">Secure access for administrators only</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Admin Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@aaavrti.com"
                                required
                                className="flex h-12 w-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                className="flex h-12 w-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <SubmitButton />
                        {errorMessage && (
                            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                        )}
                    </div>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    <Link href="/" className="text-primary hover:underline font-medium">
                        ← Back to Store
                    </Link>
                </div>

                <div className="pt-4 border-t border-border/30">
                    <p className="text-xs text-center text-muted-foreground">
                        This is a secure area. All access attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
