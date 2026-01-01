'use client';

import { cn } from '@/lib/utils';
import { Cormorant_Garamond } from 'next/font/google';
import { Star } from 'lucide-react';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface Testimonial {
    name: string;
    location: string;
    rating: number;
    text: string;
    product?: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Priya Sharma',
        location: 'Mumbai',
        rating: 5,
        text: 'Absolutely stunning saree! The quality and craftsmanship exceeded my expectations. Perfect for my sister\'s wedding.',
        product: 'Banarasi Silk Saree'
    },
    {
        name: 'Anjali Patel',
        location: 'Ahmedabad',
        rating: 5,
        text: 'Beautiful collection and excellent customer service. The kurta fit perfectly and the fabric quality is outstanding.',
        product: 'Designer Kurta Set'
    },
    {
        name: 'Meera Reddy',
        location: 'Hyderabad',
        rating: 5,
        text: 'Love the authentic designs! Fast delivery and the packaging was so elegant. Will definitely order again.',
        product: 'Chanderi Dupatta'
    }
];

export function Testimonials() {
    return (
        <section className="py-16 bg-secondary/10">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className={cn("text-4xl md:text-5xl font-light mb-4", cormorant.className)}>
                        What Our Customers Say
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Trusted by thousands of happy customers across India
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-background border border-border p-6 hover:border-primary/40 transition-all group"
                        >
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-foreground mb-6 italic leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Customer Info */}
                            <div className="border-t border-border pt-4">
                                <p className="font-medium text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                {testimonial.product && (
                                    <p className="text-xs text-primary mt-2">
                                        Purchased: {testimonial.product}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicator */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground text-sm">
                        ⭐ Rated 4.9/5 based on 2,500+ reviews
                    </p>
                </div>
            </div>
        </section>
    );
}
