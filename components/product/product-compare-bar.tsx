'use client';

import React from 'react';
import { useCompare } from '@/context/compare-context';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ProductCompareBar() {
    const { items, clearCompare, removeFromCompare } = useCompare();

    if (items.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
            >
                <div className="container mx-auto max-w-4xl pointer-events-auto">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <span className="text-sm font-medium mr-2 whitespace-nowrap">
                                Compare ({items.length}/4)
                            </span>
                            <div className="flex gap-2">
                                {items.map((item) => {
                                    let imageUrl = '/placeholder.jpg';
                                    try {
                                        const images = JSON.parse(item.images || '[]');
                                        if (images.length > 0) imageUrl = images[0];
                                    } catch (e) {
                                        // Ignore parse error
                                    }

                                    return (
                                        <div key={item._id} className="relative group flex-shrink-0">
                                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.name_en}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover h-full w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeFromCompare(item._id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 ml-4 flex-shrink-0">
                            <button
                                onClick={clearCompare}
                                className="text-sm text-gray-500 hover:text-red-600 font-medium px-2 py-1"
                            >
                                Clear
                            </button>
                            <Link
                                href="/compare"
                                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                Compare <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
