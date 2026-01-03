'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Show button after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // WhatsApp business number (update with your actual number)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    const message = encodeURIComponent('Hi! I need help with my order.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tooltip */}
            {isHovered && (
                <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-foreground text-background text-sm rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                    Chat with us on WhatsApp
                    <div className="absolute top-full right-4 -mt-1">
                        <div className="border-8 border-transparent border-t-foreground"></div>
                    </div>
                </div>
            )}

            {/* WhatsApp Button */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="w-7 h-7" />

                {/* Pulse animation */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping"></span>
            </a>
        </div>
    );
}
