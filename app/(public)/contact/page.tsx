
'use client';

import { FadeIn, SlideInFromLeft } from '@/components/ui/motion';
import { Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

const outfit = Outfit({ subsets: ['latin'] });

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Mock submission logic
    };

    return (
        <div className="min-h-screen py-12 md:py-24 container mx-auto px-4">
            <FadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h1 className={cn("text-4xl md:text-6xl font-bold", outfit.className)}>Get in <span className="text-primary italic font-serif">Touch</span></h1>
                <p className="text-muted-foreground text-lg">
                    Have a question about a product or your order? We're here to help.
                </p>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Contact Info */}
                <SlideInFromLeft className="space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-1">Visit Us</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    D/206 Jankalyan CHS, Kurla West,<br />
                                    Mumbai, Maharashtra 400070
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-1">Email Us</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-muted-foreground text-sm">General Inquiries:</p>
                                        <a href="mailto:info@ournika.com" className="text-foreground font-medium hover:text-primary transition-colors">info@ournika.com</a>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Customer Support:</p>
                                        <a href="mailto:support@ournika.com" className="text-foreground font-medium hover:text-primary transition-colors">support@ournika.com</a>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Orders & Shipping:</p>
                                        <a href="mailto:orders@ournika.com" className="text-foreground font-medium hover:text-primary transition-colors">orders@ournika.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-1">Call Us</h3>
                                <p className="text-muted-foreground mb-2">Mon-Fri from 10am to 6pm IST.</p>
                                <a href="tel:7461913495" className="text-foreground font-medium hover:text-primary transition-colors">+91 7461913495</a>
                            </div>
                        </div>
                    </div>

                    {/* Map Mock */}
                    <div className="aspect-video w-full bg-secondary/50 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 border border-border">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609903173!2d72.7410986981!3d19.08219783908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </SlideInFromLeft>

                {/* Contact Form */}
                <FadeIn delay={0.2} className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea required rows={5} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="How can we help you?" />
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
                                Send Message
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold">Message Sent!</h3>
                            <p className="text-muted-foreground">Thank you for contacting us. We will get back to you shortly.</p>
                            <button onClick={() => setSubmitted(false)} className="text-primary hover:underline">Send another message</button>
                        </div>
                    )}
                </FadeIn>
            </div>
        </div>
    );
}
