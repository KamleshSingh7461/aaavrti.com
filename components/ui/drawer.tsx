'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from '@studio-freight/react-lenis';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    side?: 'left' | 'right';
    className?: string;
    footer?: React.ReactNode;
}

export function Drawer({
    isOpen,
    onClose,
    children,
    title,
    description,
    side = 'right',
    className,
    footer
}: DrawerProps) {
    const lenis = useLenis();

    // Prevent body scroll when drawer is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            lenis?.stop();
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
            lenis?.start();
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
            lenis?.start();
        };
    }, [isOpen, lenis]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: side === 'right' ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: side === 'right' ? '100%' : '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed top-0 bottom-0 z-[101] w-full max-w-md bg-background shadow-2xl border-l border-border/10 flex flex-col",
                            side === 'right' ? 'right-0' : 'left-0',
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 flex-shrink-0">
                            <div>
                                {title && (
                                    <h2 className={cn("text-2xl font-medium", cormorant.className)}>
                                        {title}
                                    </h2>
                                )}
                                {description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 opacity-70" />
                            </button>
                        </div>

                        {/* Content Area - Not scrollable by default, children handle nested scroll if needed */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {children}
                        </div>

                        {/* Optional Footer */}
                        {footer && (
                            <div className="flex-shrink-0 border-t border-border/10 bg-background/80 backdrop-blur-md">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
