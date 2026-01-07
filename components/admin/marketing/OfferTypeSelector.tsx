'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Percent, DollarSign, Package, Gift, Grid3x3, Hash, TrendingUp } from 'lucide-react';

const OFFER_TYPES = [
    {
        value: 'PERCENTAGE',
        label: 'Percentage Discount',
        description: 'Give a percentage off the total',
        example: '20% off',
        icon: Percent,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
        value: 'FIXED',
        label: 'Fixed Amount Off',
        description: 'Deduct a fixed amount',
        example: '₹500 off',
        icon: DollarSign,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
        value: 'BUNDLE',
        label: 'Bundle Offer',
        description: 'Buy multiple items at a special price',
        example: 'Buy 3 @ ₹1999',
        icon: Package,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
        value: 'BOGO',
        label: 'Buy X Get Y',
        description: 'Buy some, get some free or discounted',
        example: 'Buy 2 Get 1 Free',
        icon: Gift,
        color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
        value: 'MIX_MATCH',
        label: 'Mix & Match',
        description: 'Pick any items from a category',
        example: 'Any 3 @ ₹2500',
        icon: Grid3x3,
        color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
        value: 'QUANTITY_DISCOUNT',
        label: 'Quantity Discount',
        description: 'Discount based on quantity purchased',
        example: '3 of ₹999 @ ₹2200',
        icon: Hash,
        color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    {
        value: 'TIERED',
        label: 'Tiered Pricing',
        description: 'Different discounts at different quantities',
        example: 'Buy 2 = 10%, Buy 3 = 20%',
        icon: TrendingUp,
        color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
];

interface OfferTypeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OfferTypeSelector({ open, onOpenChange }: OfferTypeSelectorProps) {
    const router = useRouter();

    const handleSelectType = (type: string) => {
        router.push(`/admin/marketing/offers/new?type=${type}`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose Offer Type</DialogTitle>
                    <DialogDescription>
                        Select the type of promotional offer you want to create
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {OFFER_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.value}
                                onClick={() => handleSelectType(type.value)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${type.color}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm mb-1">{type.label}</div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {type.description}
                                        </div>
                                        <div className="text-xs font-mono bg-white/50 px-2 py-1 rounded inline-block">
                                            {type.example}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
