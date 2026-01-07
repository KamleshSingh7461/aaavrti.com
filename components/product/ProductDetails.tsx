'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useLanguage } from '@/lib/language';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Heart, ShieldCheck, Truck, ArrowRight, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';
import { ProductOffers } from './ProductOffers';
import { SizeGuideModal } from './SizeGuideModal';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

interface ProductDetailsProps {
    product: Product;
    offers?: {
        id: string;
        code: string;
        type: string;
        value: number;
        minAmount: number;
        maxDiscount: number | null;
        endDate: string | null;
    }[];
}

export function ProductDetails({ product, offers = [] }: ProductDetailsProps) {
    const { t } = useLanguage();

    // Parse variants if they are JSON string (backup check, though fetcher should handle it)
    const variants = useMemo(() => {
        if (typeof product.variants === 'string') {
            try { return JSON.parse(product.variants); } catch (e) { return []; }
        }
        return product.variants || [];
    }, [product.variants]);

    // Derive available attributes from variants
    const availableAttributes = useMemo(() => {
        if (!variants.length) return product.attributes || {}; // Fallback to legacy

        const attrs: Record<string, Set<string>> = {};
        variants.forEach((v: any) => {
            Object.entries(v.attributes).forEach(([key, val]) => {
                if (!attrs[key]) attrs[key] = new Set();
                attrs[key].add(val as string);
            });
        });

        // Convert Sets to Arrays
        const result: Record<string, string[]> = {};
        Object.keys(attrs).forEach(key => {
            result[key] = Array.from(attrs[key]);
        });
        return result;
    }, [variants, product.attributes]);

    const initialImage = product.images?.[0] || '/placeholder.jpg';
    const [activeImage, setActiveImage] = useState(initialImage);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Initialize options with first available values
    useEffect(() => {
        if (Object.keys(selectedOptions).length === 0 && Object.keys(availableAttributes).length > 0) {
            const defaults: Record<string, string> = {};
            // Try to find the first valid variant to set defaults
            // For now, just pick first value of each attribute
            Object.keys(availableAttributes).forEach(key => {
                defaults[key] = availableAttributes[key][0];
            });
            setSelectedOptions(defaults);
        }
    }, [availableAttributes]);

    // Find matching variant
    useEffect(() => {
        if (variants.length === 0) return;

        const match = variants.find((v: any) => {
            return Object.entries(selectedOptions).every(([key, val]) => v.attributes[key] === val);
        });

        setSelectedVariant(match || null);
    }, [selectedOptions, variants]);

    // Determine which images to show
    const displayedImages = useMemo(() => {
        const productImgs = product.images || [];

        // If variant has specific images, show them FIRST, then append unique product images
        if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
            const variantImgs = selectedVariant.images;
            const uniqueProductImgs = productImgs.filter((img: string) => !variantImgs.includes(img));
            return [...variantImgs, ...uniqueProductImgs];
        }

        // Fallback to legacy single image if array is empty but legacy exists
        if (selectedVariant && selectedVariant.image) {
            const variantImg = selectedVariant.image;
            if (!productImgs.includes(variantImg)) {
                return [variantImg, ...productImgs];
            }
            return productImgs;
        }

        // Fallback to product images
        return productImgs.length > 0 ? productImgs : ['/placeholder.jpg'];
    }, [selectedVariant, product.images]);

    // Update active image when displayed set changes
    useEffect(() => {
        if (displayedImages.length > 0) {
            setActiveImage(displayedImages[0]);
        }
    }, [displayedImages]);

    const handleOptionSelect = (key: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [key]: value }));
    };

    const currentPrice = selectedVariant ? Number(selectedVariant.price) : product.price;
    const currentStock = selectedVariant ? Number(selectedVariant.stock) : (product.stock || 0);
    const isOutOfStock = currentStock <= 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">
            {/* Left: Image Gallery (Futuristic & Immersive) */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                <FadeIn>
                    <div className="aspect-[3/4] relative overflow-hidden bg-[#F9F8F6] rounded-[2rem] cursor-zoom-in group shadow-2xl shadow-[#D1CDC0]/30 border border-white/50">
                        <Image
                            src={activeImage}
                            alt={product.name_en}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            priority
                            quality={100}
                        />

                        {/* Futuristic Floating Thumbnails */}
                        {displayedImages.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[90%]">
                                <StaggerContainer className="flex items-center gap-3 p-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl overflow-x-auto no-scrollbar">
                                    {displayedImages.map((img, i) => (
                                        <StaggerItem key={i} className="shrink-0">
                                            <button
                                                onClick={() => setActiveImage(img)}
                                                className={cn(
                                                    "relative w-12 h-12 rounded-full overflow-hidden transition-all duration-300 border-2",
                                                    activeImage === img
                                                        ? 'border-white scale-110 shadow-lg ring-2 ring-black/20'
                                                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                                                )}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`View ${i}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </button>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>
                        )}
                    </div>
                </FadeIn>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col h-full lg:pt-4">
                <FadeIn delay={0.2} className="space-y-8">
                    {/* Header - Super Clean */}
                    <div className="space-y-6 border-b border-gray-100 pb-8">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <h1 className={cn("text-4xl md:text-6xl font-normal text-foreground leading-[1.1] tracking-normal", cormorant.className)}>
                                    {t({ en: product.name_en, hi: product.name_hi })}
                                </h1>
                                <WishlistButton product={product} className="shrink-0 h-14 w-14 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center" />
                            </div>

                            {selectedVariant && (
                                <p className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                                    REF. {selectedVariant.sku}
                                </p>
                            )}
                        </div>

                        {/* Price - Bold & Simple */}
                        {/* Price - Bold & Simple */}
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-medium tracking-tight">
                                ₹{currentPrice.toLocaleString('en-IN')}
                            </span>

                            {/* Discount logic: Check compareAtPrice first, then fallback to variant difference */}
                            {(product.compareAtPrice && product.compareAtPrice > currentPrice) ? (
                                <>
                                    <span className="text-xl text-neutral-400 line-through decoration-1">
                                        ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded-sm uppercase tracking-widest">
                                        {Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}% OFF
                                    </span>
                                </>
                            ) : (currentPrice !== product.price) && (
                                <span className="text-xl text-neutral-400 line-through decoration-1">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </span>
                            )}

                            {(currentPrice !== product.price || offers.length > 0) && !product.compareAtPrice && (
                                <span className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    Offer Available
                                </span>
                            )}
                        </div>

                        {/* Dynamic Stock Indicator */}
                        {currentStock < 10 && currentStock > 0 && (
                            <p className="text-sm font-medium text-amber-600 animate-pulse">
                                Only {currentStock} left in stock - Order now!
                            </p>
                        )}

                        <p className="text-sm text-neutral-500 font-medium">
                            Tax included. Free shipping worldwide.
                        </p>
                    </div>

                    {/* Attribute Selectors */}
                    <div className="space-y-6">
                        {Object.entries(availableAttributes).map(([key, values]) => {
                            const isColor = ['color', 'colour', 'shade'].includes(key.toLowerCase());
                            const isSize = ['size', 'measure'].includes(key.toLowerCase());

                            return (
                                <div key={key} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                                            {key}: <span className="text-foreground">{selectedOptions[key]}</span>
                                        </span>
                                        {isSize && (
                                            <button
                                                onClick={() => setShowSizeGuide(true)}
                                                className="text-xs underline text-muted-foreground hover:text-foreground"
                                            >
                                                Size Guide
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {(values as string[]).map((val: string) => {
                                            const isSelected = selectedOptions[key] === val;

                                            if (isColor) {
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleOptionSelect(key, val)}
                                                        className={cn(
                                                            "w-12 h-12 rounded-full border-2 transition-all relative group",
                                                            isSelected ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:border-border hover:scale-105'
                                                        )}
                                                        style={{ backgroundColor: val.toLowerCase() }}
                                                        title={val}
                                                    >
                                                        {/* Hover Ring */}
                                                        <span className="absolute inset-0 rounded-full ring-1 ring-black/5" />
                                                    </button>
                                                )
                                            }

                                            // Modern Pill Selector (Luxe)
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleOptionSelect(key, val)}
                                                    className={cn(
                                                        "min-w-[4rem] px-6 h-12 flex items-center justify-center rounded-full border transition-all text-sm font-bold tracking-wide relative overflow-hidden",
                                                        isSelected
                                                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'border-[#D1CDC0] bg-white text-[#1A1A1A] hover:border-primary hover:text-primary'
                                                    )}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Actions: Quantity + Cart */}
                    <div className="space-y-6 pt-6 border-t border-[#E6E2D3]">
                        <div className="flex gap-4">
                            {/* Quantity Selector */}
                            <div className="h-16 w-36 rounded-full border border-[#D1CDC0] bg-[#F9F8F6] flex items-center justify-between px-2 shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-[#5C4033] transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className={cn("text-xl font-medium text-[#1A1A1A]", cormorant.className)}>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-[#5C4033] transition-colors"
                                    disabled={quantity >= currentStock}
                                >
                                    +
                                </button>
                            </div>

                            <AddToCartButton
                                product={product}
                                variantId={selectedVariant?.id}
                                disabled={isOutOfStock}
                                quantity={quantity}
                                className="flex-1 h-16 text-lg rounded-full bg-primary text-white hover:bg-[#B89628] transition-all hover:scale-[1.01] active:scale-[0.99] uppercase tracking-[0.2em] font-bold shadow-xl shadow-primary/20"
                            />
                        </div>

                        {/* Trust Badges - Horizontal Scrollable on Mobile */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                                    <Truck className="h-5 w-5 text-foreground/70" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-medium">Free Shipping</p>
                                    <p className="text-muted-foreground">On all prepaid orders</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-foreground/70" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-medium">Authentic</p>
                                    <p className="text-muted-foreground">100% Genuine Products</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                                    <Share2 className="h-5 w-5 text-foreground/70" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-medium">Secure Payment</p>
                                    <p className="text-muted-foreground">SSL Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Accordion */}
                    <div className="pt-8">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="description" className="border-t border-border/40">
                                <AccordionTrigger className="text-sm uppercase tracking-wider font-medium hover:no-underline py-4">
                                    Description
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed prose prose-sm max-w-none pb-6">
                                    {t({ en: product.description_en, hi: product.description_hi })}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="details" className="border-t border-border/40">
                                <AccordionTrigger className="text-sm uppercase tracking-wider font-medium hover:no-underline py-4">
                                    Product Details
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                                        {/* Dynamic Product Attributes */}
                                        {(() => {
                                            try {
                                                const attrs = typeof product.attributes === 'string'
                                                    ? JSON.parse(product.attributes)
                                                    : product.attributes || {};

                                                const entries = Object.entries(attrs);
                                                if (entries.length === 0) {
                                                    return <li>No additional details available.</li>;
                                                }

                                                return entries.map(([key, value]) => (
                                                    <li key={key}>
                                                        <span className="font-medium text-foreground capitalize">{key}:</span> {value as string}
                                                    </li>
                                                ));
                                            } catch (e) {
                                                return <li>Details unavailable</li>;
                                            }
                                        })()}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shipping" className="border-t border-border/40 border-b">
                                <AccordionTrigger className="text-sm uppercase tracking-wider font-medium hover:no-underline py-4">
                                    Shipping & Returns
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground pb-6 leading-relaxed">
                                    Free shipping on all prepaid orders. We dispatch within 24-48 hours.
                                    Easy returns within 7 days of delivery.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </FadeIn>
            </div>

            {/* Size Guide Modal */}
            {
                showSizeGuide && (
                    <SizeGuideModal
                        categoryId={typeof product.categoryId === 'string' ? product.categoryId : (product.categoryId as any)?._id || product.categoryId}
                        onClose={() => setShowSizeGuide(false)}
                    />
                )
            }
        </div >
    );
}
