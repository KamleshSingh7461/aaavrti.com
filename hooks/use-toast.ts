
import { create } from 'zustand';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    type?: ToastType;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

        if (toast.duration !== Infinity) {
            setTimeout(() => {
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
            }, toast.duration || 3000);
        }
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => {
    const { addToast } = useToastStore();

    // Shadcn compatible interface
    const toast = ({ title, description, variant }: { title?: string, description?: string, variant?: 'default' | 'destructive' }) => {
        addToast({
            title,
            description,
            type: variant === 'destructive' ? 'error' : 'default'
        });
    };

    return { toast };
};
