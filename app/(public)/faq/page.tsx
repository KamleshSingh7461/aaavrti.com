
'use client';

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const outfit = Outfit({ subsets: ['latin'] });

const FAQS = [
    {
        question: "How do I know my size?",
        answer: "We provide a detailed size chart on every product page. Since our products are handcrafted, there might be slight variations, but we ensure fit consistency. For custom sizing requests, please contact us."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently, we ship to all pin codes within India. International shipping is coming soon! Stay tuned to our newsletter for updates."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 3-day easy return policy for defective or incorrect items. Please refer to our Refund Policy page for full details on the process."
    },
    {
        question: "Are the fabrics authentic?",
        answer: "Absolutely. We source directly from weavers in Varanasi, Lucknow, and other handloom hubs. Every product comes with an authenticity assurance."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive an SMS and email with the tracking link (via Shiprocket). You can also view status in 'My Orders'."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen py-12 md:py-24 container mx-auto px-4 max-w-4xl">
            <FadeIn className="text-center space-y-4 mb-16">
                <h1 className={cn("text-4xl md:text-5xl font-bold", outfit.className)}>Frequently Asked <span className="text-primary italic font-serif">Questions</span></h1>
                <p className="text-muted-foreground text-lg">
                    Common questions about our products, shipping, and services.
                </p>
            </FadeIn>

            <StaggerContainer className="space-y-4">
                {FAQS.map((faq, i) => (
                    <StaggerItem key={i}>
                        <div
                            className={cn(
                                "group border border-border rounded-xl bg-card overflow-hidden transition-all duration-300",
                                openIndex === i ? "shadow-md border-primary/20 bg-accent/5" : "hover:border-primary/20"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-semibold text-lg">{faq.question}</span>
                                <span className={cn(
                                    "p-2 rounded-full border transition-all duration-300",
                                    openIndex === i ? "bg-primary text-primary-foreground border-primary rotate-180" : "bg-secondary text-muted-foreground border-border group-hover:bg-primary/10"
                                )}>
                                    {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </span>
                            </button>

                            <div
                                className={cn(
                                    "grid transition-all duration-300 ease-in-out text-muted-foreground px-6",
                                    openIndex === i ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
                                )}
                            >
                                <div className="overflow-hidden leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </div>
    );
}
