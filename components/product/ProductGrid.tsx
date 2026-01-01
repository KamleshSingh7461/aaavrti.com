
'use client'; // Client component for animation

import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/motion';

interface ProductGridProps {
    products: Product[];
    selectedColor?: string;
}

export function ProductGrid({ products, selectedColor }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <FadeIn className="py-24 text-center">
                <p className="text-muted-foreground">No products found in this category yet.</p>
            </FadeIn>
        );
    }

    return (
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
                <StaggerItem key={product.id}>
                    <ProductCard product={product} selectedColor={selectedColor} />
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
