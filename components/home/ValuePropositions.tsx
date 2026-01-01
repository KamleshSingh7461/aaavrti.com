'use client';

import { cn } from '@/lib/utils';
import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';

const valueProps = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On orders above ₹2,000'
    },
    {
        icon: RotateCcw,
        title: 'Easy Returns',
        description: '30-day return policy'
    },
    {
        icon: Shield,
        title: 'Secure Payments',
        description: '100% safe & secure'
    },
    {
        icon: Headphones,
        title: '24/7 Support',
        description: 'Dedicated customer care'
    }
];

export function ValuePropositions() {
    return (
        <section className="py-12 border-y border-border/10 bg-secondary/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {valueProps.map((prop, index) => {
                        const Icon = prop.icon;
                        return (
                            <div
                                key={index}
                                className="text-center space-y-3 group"
                            >
                                <div className="w-14 h-14 mx-auto bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Icon className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-1">
                                        {prop.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {prop.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
