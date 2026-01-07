'use client';

import { Tag, Percent, Gift, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfferBadgeProps {
    offerType: 'PERCENTAGE' | 'FIXED' | 'BUNDLE' | 'BOGO' | 'MIX_MATCH' | 'QUANTITY_DISCOUNT' | 'TIERED';
    badgeText?: string;
    value?: number;
    bundleQuantity?: number;
    bundlePrice?: number;
    buyQuantity?: number;
    getQuantity?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function OfferBadge({
    offerType,
    badgeText,
    value,
    bundleQuantity,
    bundlePrice,
    buyQuantity,
    getQuantity,
    className,
    size = 'md'
}: OfferBadgeProps) {
    // Generate badge text if not provided
    const text = badgeText || generateBadgeText(offerType, value, bundleQuantity, bundlePrice, buyQuantity, getQuantity);

    // Select icon based on offer type
    const Icon = getOfferIcon(offerType);

    // Size classes
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    // Color scheme based on offer type
    const colorClasses = getColorClasses(offerType);

    return (
        <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full font-medium',
            sizeClasses[size],
            colorClasses,
            className
        )}>
            <Icon className={cn(
                size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
            )} />
            <span>{text}</span>
        </div>
    );
}

function generateBadgeText(
    type: string,
    value?: number,
    bundleQty?: number,
    bundlePrice?: number,
    buyQty?: number,
    getQty?: number
): string {
    switch (type) {
        case 'PERCENTAGE':
            return `${value}% OFF`;
        case 'FIXED':
            return `₹${value} OFF`;
        case 'BUNDLE':
        case 'MIX_MATCH':
        case 'QUANTITY_DISCOUNT':
            return `${bundleQty} @ ₹${bundlePrice}`;
        case 'BOGO':
            return `Buy ${buyQty} Get ${getQty}`;
        case 'TIERED':
            return 'Tiered Discount';
        default:
            return 'Special Offer';
    }
}

function getOfferIcon(type: string) {
    switch (type) {
        case 'PERCENTAGE':
            return Percent;
        case 'BOGO':
            return Gift;
        case 'BUNDLE':
        case 'MIX_MATCH':
        case 'QUANTITY_DISCOUNT':
            return Package;
        default:
            return Tag;
    }
}

function getColorClasses(type: string): string {
    switch (type) {
        case 'PERCENTAGE':
        case 'FIXED':
            return 'bg-red-100 text-red-700 border border-red-200';
        case 'BOGO':
            return 'bg-green-100 text-green-700 border border-green-200';
        case 'BUNDLE':
        case 'MIX_MATCH':
        case 'QUANTITY_DISCOUNT':
            return 'bg-blue-100 text-blue-700 border border-blue-200';
        case 'TIERED':
            return 'bg-purple-100 text-purple-700 border border-purple-200';
        default:
            return 'bg-primary/10 text-primary border border-primary/20';
    }
}
