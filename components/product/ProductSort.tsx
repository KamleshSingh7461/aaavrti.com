'use client';

import { ChevronDown } from 'lucide-react';

interface ProductSortProps {
    value: string;
    onChange: (value: string) => void;
}

const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
];

export function ProductSort({ value, onChange }: ProductSortProps) {
    return (
        <div className="relative inline-block">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-background border border-foreground/20 hover:border-foreground rounded-none px-4 py-2.5 pr-10 text-xs uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer transition-colors w-full"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-foreground/70" />
        </div>
    );
}
