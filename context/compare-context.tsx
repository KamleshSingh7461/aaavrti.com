'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Product {
    _id: string;
    name_en: string;
    price: number;
    images: string; // JSON string of images
    slug?: string;
    sku?: string;
    description_en?: string;
    category?: any;
    material?: string;
    color?: string;
}

interface CompareContextType {
    items: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('compareable_items');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare items", e);
            }
        }
    }, []);

    const saveItems = (newItems: Product[]) => {
        setItems(newItems);
        localStorage.setItem('compareable_items', JSON.stringify(newItems));
    };

    const addToCompare = (product: Product) => {
        if (items.some(i => i._id === product._id)) {
            toast.info("Product already in comparison");
            return;
        }
        if (items.length >= 4) {
            toast.warning("You can compare up to 4 products only");
            return;
        }
        saveItems([...items, product]);
        toast.success("Added to comparison");
    };

    const removeFromCompare = (productId: string) => {
        saveItems(items.filter(i => i._id !== productId));
    };

    const clearCompare = () => {
        saveItems([]);
        toast.success("Comparison list cleared");
    };

    const isInCompare = (productId: string) => {
        return items.some(i => i._id === productId);
    };

    return (
        <CompareContext.Provider value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
