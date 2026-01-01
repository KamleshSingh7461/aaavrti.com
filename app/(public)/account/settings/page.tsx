'use client';

import { useSession } from 'next-auth/react';
import { updateUserProfile } from '@/actions/account-actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { User, Loader2, Save } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = await updateUserProfile(formData);

        if (res.error) {
            toast({
                title: "Error",
                description: res.error,
                variant: "destructive"
            });
        } else {
            // Update session client-side
            await update({ name: formData.get('name') });
            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });
        }
        setLoading(false);
    };

    if (!session?.user) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <h1 className={cn("text-3xl font-serif font-medium", cormorant.className)}>Settings</h1>
            </div>

            <FadeIn>
                <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
                    <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Personal Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={session.user.email || ''}
                                disabled
                                className="w-full bg-secondary/20 border border-border px-4 py-3 text-sm rounded-md cursor-not-allowed text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly for security reasons.</p>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                defaultValue={session.user.name || ''}
                                required
                                minLength={2}
                                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                            />
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </FadeIn>
        </div>
    );
}
