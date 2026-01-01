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
            {/* Left: Image Gallery */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                <FadeIn>
                    <div className="aspect-[3/4] relative overflow-hidden bg-secondary/10 cursor-zoom-in group shadow-sm transition-all duration-500">
                        <Image
                            src={activeImage}
                            alt={product.name_en}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                            quality={95}
                        />
                        {/* Image Indicators for Mobile */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                            {displayedImages.map((_, i) => (
                                <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", activeImage === displayedImages[i] ? "bg-white w-3" : "bg-white/50")} />
                            ))}
                        </div>
                    </div>
                </FadeIn>

                {/* Thumbnails - Desktop Grid */}
                {displayedImages.length > 1 && (
                    <StaggerContainer className="hidden lg:grid grid-cols-5 gap-3">
                        {displayedImages.map((img, i) => (
                            <StaggerItem key={i}>
                                <button
                                    onClick={() => setActiveImage(img)}
                                    className={cn(
                                        "aspect-[3/4] relative overflow-hidden bg-secondary/10 transition-all duration-300",
                                        activeImage === img ? 'ring-1 ring-primary brightness-100 shadow-md' : 'brightness-90 hover:brightness-100 opacity-70 hover:opacity-100'
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
                )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col h-full lg:pt-4">
                <FadeIn delay={0.2} className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4 border-b border-border/40 pb-6">
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <h1 className={cn("text-3xl md:text-5xl lg:text-5xl font-light text-foreground tracking-tight leading-tight", cormorant.className)}>
                                    {t({ en: product.name_en, hi: product.name_hi })}
                                </h1>
                                <WishlistButton product={product} className="shrink-0 ml-4 hover:bg-secondary rounded-full p-2 h-10 w-10 transition-colors" />
                            </div>
                            {selectedVariant && (
                                <p className="text-xs tracking-widest text-muted-foreground uppercase">SKU: {selectedVariant.sku}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-3">
                                <span className={cn("text-4xl font-light text-foreground", cormorant.className)}>
                                    ₹{currentPrice.toLocaleString('en-IN')}
                                </span>
                                {currentPrice !== product.price && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                )}
                                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    {t({ en: 'In Stock', hi: 'स्टॉक में है' })}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
                            <p className="text-sm text-muted-foreground font-light">
                                {t({ en: 'Price inclusive of all taxes. Free shipping on all prepaid orders.', hi: 'सभी करों सहित। सभी प्रीपेड ऑर्डर पर मुफ्त शिपिंग।' })}
                            </p>
                        </div>

                        {/* Offers Section */}
                        {offers.length > 0 && (
                            <div className="pt-4">
                                <ProductOffers offers={offers} />
                            </div>
                        )}
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
                                        {isSize && <button className="text-xs underline text-muted-foreground hover:text-foreground">Size Guide</button>}
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
                                                            "w-10 h-10 rounded-full border shadow-sm transition-all relative group",
                                                            isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105 ring-1 ring-transparent hover:ring-border'
                                                        )}
                                                        style={{ backgroundColor: val.toLowerCase() }}
                                                        title={val}
                                                    >
                                                        {isSelected && (
                                                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                                                <Check className="w-5 h-5" />
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            }

                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleOptionSelect(key, val)}
                                                    className={cn(
                                                        "min-w-[3.5rem] px-4 h-11 flex items-center justify-center border transition-all text-sm font-medium relative overflow-hidden",
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                                            : 'border-border/60 bg-transparent hover:border-primary hover:text-primary'
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

                    {/* Actions */}
                    <div className="space-y-4 pt-6">
                        <AddToCartButton
                            product={product}
                            variantId={selectedVariant?.id}
                            disabled={isOutOfStock}
                            className="w-full h-14 text-lg bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-widest font-medium"
                        />

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
        </div>
    );
}
