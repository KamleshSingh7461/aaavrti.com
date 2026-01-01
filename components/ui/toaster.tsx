
'use client';

import { useToastStore } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toaster() {
    const { toasts, removeToast } = useToastStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-0 right-0 p-6 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4 flex items-start gap-4"
                    >
                        <div className="mt-0.5">
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                            {toast.type === 'default' && <Info className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                            {toast.title && <h3 className="font-medium text-sm">{toast.title}</h3>}
                            {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
