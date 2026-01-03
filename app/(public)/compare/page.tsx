'use client';

import React from 'react';
import { useCompare } from '@/context/compare-context';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export default function ComparePage() {
    const { items, removeFromCompare, clearCompare } = useCompare();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h1 className={cn("text-2xl font-medium mb-2", cormorant.className)}>No products to compare</h1>
                <p className="text-gray-500 mb-6 max-w-md text-center">
                    Add products to the comparison list to see them side-by-side.
                </p>
                <Link href="/products">
                    <Button>Browse Products</Button>
                </Link>
            </div>
        );
    }

    const parseImages = (json: string) => {
        try {
            return JSON.parse(json || '[]');
        } catch {
            return [];
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className={cn("text-3xl font-serif font-medium", cormorant.className)}>Product Comparison</h1>
                <Button variant="ghost" onClick={clearCompare} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Clear All
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="p-4 w-48 border-b border-gray-100"></th>
                            {items.map(item => (
                                <th key={item._id} className="p-4 border-b border-gray-100 min-w-[250px] relative group">
                                    <button
                                        onClick={() => removeFromCompare(item._id)}
                                        className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        <Image
                                            src={parseImages(item.images)[0] || '/placeholder.jpg'}
                                            alt={item.name_en}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium text-lg leading-tight mb-1">{item.name_en}</h3>
                                    <p className="font-semibold text-lg">₹{item.price.toLocaleString('en-IN')}</p>
                                    <Link href={`/product/${item.slug || item._id}`}>
                                        <Button className="w-full mt-4" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Category Row */}
                        <tr>
                            <th className="p-4 bg-gray-50/50 text-sm font-medium text-gray-500">Category</th>
                            {items.map(item => (
                                <td key={item._id} className="p-4">
                                    {typeof item.category === 'object' ? (item.category as any)?.name_en : item.category || '-'}
                                </td>
                            ))}
                        </tr>

                        {/* Material Row */}
                        <tr>
                            <th className="p-4 bg-gray-50/50 text-sm font-medium text-gray-500">Material</th>
                            {items.map(item => (
                                <td key={item._id} className="p-4 capitalize">
                                    {item.material || '-'}
                                </td>
                            ))}
                        </tr>

                        {/* Color Row */}
                        <tr>
                            <th className="p-4 bg-gray-50/50 text-sm font-medium text-gray-500">Color</th>
                            {items.map(item => (
                                <td key={item._id} className="p-4">
                                    {item.color ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-200"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="capitalize">{item.color}</span>
                                        </div>
                                    ) : '-'}
                                </td>
                            ))}
                        </tr>

                        {/* SKU Row */}
                        <tr>
                            <th className="p-4 bg-gray-50/50 text-sm font-medium text-gray-500">SKU</th>
                            {items.map(item => (
                                <td key={item._id} className="p-4 font-mono text-xs text-gray-500">
                                    {item.sku || '-'}
                                </td>
                            ))}
                        </tr>

                        {/* Description Row */}
                        <tr>
                            <th className="p-4 bg-gray-50/50 text-sm font-medium text-gray-500 align-top">Description</th>
                            {items.map(item => (
                                <td key={item._id} className="p-4 text-sm text-gray-600 align-top line-clamp-4">
                                    {item.description_en ? (
                                        <div className="line-clamp-4">{item.description_en}</div>
                                    ) : '-'}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
