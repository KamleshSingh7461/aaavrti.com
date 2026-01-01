import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi';

interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    // Helper to get correct string based on current language
    t: (obj: { en: string; hi?: string | null }) => string;
}

export const useLanguage = create<LanguageStore>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'hi' : 'en' })),

            t: (obj) => {
                const { language } = get();
                if (language === 'hi' && obj.hi) {
                    return obj.hi;
                }
                return obj.en;
            }
        }),
        {
            name: 'aaavrti-language-storage',
        }
    )
);
