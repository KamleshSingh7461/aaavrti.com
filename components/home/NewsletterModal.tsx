"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/newsletter-actions";

export function NewsletterModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        if (pathname === '/unsubscribe') return;

        // Check localStorage
        const dismissed = localStorage.getItem("newsletter_dismissed");
        // if (!dismissed) { // BYPASS CHECK FOR DEBUGGING
        const timer = setTimeout(() => {
            console.log("Newsletter Modal Timer trigger (Bypassed Check)");
            setIsOpen(true);
        }, 2000); // 2 seconds delay

        return () => clearTimeout(timer);
        // }
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem("newsletter_dismissed", "true");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const result = await subscribeNewsletter(email);
            if (result.success) {
                toast.success(result.message || "Welcome to the community! Check your email for the discount code.");
                setIsOpen(false);
                localStorage.setItem("newsletter_dismissed", "true");
            } else {
                toast.error(result.error || "Failed to subscribe");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleDismiss();
            setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-xl border-none shadow-2xl bg-white p-0 overflow-hidden">
                <div className="relative flex flex-col items-center justify-center p-8 text-center space-y-6">
                    {/* Decorative styling */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-serif tracking-tight text-foreground">
                            Join the Community
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm max-w-xs mx-auto">
                            Sign up for our newsletter and get <span className="font-semibold text-primary">10% OFF</span> your first authentic heritage purchase.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-center"
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full rounded-md uppercase tracking-wide font-medium"
                            disabled={loading}
                        >
                            {loading ? "Subscribing..." : "Unlock 10% Off"}
                        </Button>
                    </form>

                    <button
                        onClick={handleDismiss}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
                    >
                        No thanks, I prefer paying full price
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
