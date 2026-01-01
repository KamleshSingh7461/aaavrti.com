'use client';

import { useLanguage } from '@/lib/language';

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center justify-center font-medium text-xs border border-border/30 px-3 py-1.5 hover:border-primary hover:text-primary transition-all min-w-[3rem] uppercase tracking-wider"
            title="Switch Language"
        >
            {language === 'en' ? 'EN' : 'हि'}
        </button>
    );
}
