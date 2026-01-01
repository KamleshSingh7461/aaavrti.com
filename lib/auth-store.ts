import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, name: string) => void;
    logout: () => void;
}

export const useAuth = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            login: (email, name) => {
                set({
                    isLoggedIn: true,
                    user: {
                        id: 'mock-user-1',
                        email,
                        name,
                    },
                });
            },
            logout: () => {
                set({ isLoggedIn: false, user: null });
            },
        }),
        {
            name: 'aaavrti-auth-storage',
        }
    )
);
