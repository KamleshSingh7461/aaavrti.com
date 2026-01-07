'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProductFilters } from './ProductFilters';
import { ProductSort } from './ProductSort';
import { ProductGrid } from './ProductGrid';

interface ProductBrowserProps {
    initialProducts: any[];
    categories: Array<{ id: string; name_en: string; slug: string; parentId?: string }>;
    minPrice: number;
    maxPrice: number;
    basePath?: string;
    initialTag?: string;
    initialSort?: string;
}

export function ProductBrowser({ initialProducts, categories, minPrice, maxPrice, basePath = '/products', initialTag, initialSort }: ProductBrowserProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        searchParams.get('category') || undefined
    );

    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minPrice')) || minPrice,
        Number(searchParams.get('maxPrice')) || maxPrice
    ]);
    const [showInStockOnly, setShowInStockOnly] = useState(
        searchParams.get('inStock') === 'true'
    );
    const [showOffersOnly, setShowOffersOnly] = useState(
        searchParams.get('offers') === 'true'
    );
    const [selectedColors, setSelectedColors] = useState<string[]>(
        searchParams.get('colors')?.split(',') || []
    );
    const [selectedSizes, setSelectedSizes] = useState<string[]>(
        searchParams.get('sizes')?.split(',') || []
    );
    const [sortBy, setSortBy] = useState(initialSort || searchParams.get('sort') || 'newest');
    const [selectedTag, setSelectedTag] = useState<string | undefined>(initialTag || searchParams.get('tag') || undefined);
    const [minRating, setMinRating] = useState<number | undefined>(
        searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined
    );

    // Extract available colors from products and their variants
    const availableColors = Array.from(new Set(
        initialProducts.flatMap(p => {
            const colors = new Set<string>();
            const legacyColor = p.attributes?.color || p.attributes?.Color || p.attributes?.COLOR;
            if (legacyColor) colors.add(legacyColor);
            if (p.variants) {
                try {
                    const variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
                    variants.forEach((v: any) => {
                        const vColor = v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR || v.attributes?.Colour;
                        if (vColor) colors.add(vColor);
                    });
                } catch (e) { }
            }
            return Array.from(colors).map(c => String(c));
        })
    )).sort();

    // Extract available sizes
    const availableSizes = Array.from(new Set(
        initialProducts.flatMap(p => {
            const sizes = new Set<string>();

            const addSize = (val: any) => {
                if (!val) return;
                if (Array.isArray(val)) {
                    val.forEach(v => {
                        if (typeof v === 'string') sizes.add(v);
                        else sizes.add(String(v));
                    });
                } else if (typeof val === 'string') {
                    sizes.add(val);
                } else {
                    sizes.add(String(val));
                }
            };

            // Check legacy attributes
            const legacySize = p.attributes?.size || p.attributes?.Size || p.attributes?.SIZE;
            addSize(legacySize);

            // Check variants
            if (p.variants) {
                try {
                    const variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
                    variants.forEach((v: any) => {
                        const vSize = v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE;
                        addSize(vSize);
                    });
                } catch (e) { }
            }
            return Array.from(sizes);
        })
    )).sort((a, b) => {
        const strA = String(a);
        const strB = String(b);
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
        const idxA = sizeOrder.indexOf(strA);
        const idxB = sizeOrder.indexOf(strB);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return strA.localeCompare(strB);
    });

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedTag) params.set('tag', selectedTag);
        if (selectedCategory) params.set('category', selectedCategory);
        if (priceRange[0] !== minPrice) params.set('minPrice', priceRange[0].toString());
        if (priceRange[1] !== maxPrice) params.set('maxPrice', priceRange[1].toString());
        if (showInStockOnly) params.set('inStock', 'true');
        if (showOffersOnly) params.set('offers', 'true');
        if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
        if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
        if (minRating) params.set('rating', minRating.toString());
        if (sortBy !== 'newest') params.set('sort', sortBy);

        const queryString = params.toString();
        router.push(`${basePath}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    }, [selectedTag, selectedCategory, priceRange, showInStockOnly, showOffersOnly, selectedColors, selectedSizes, minRating, sortBy, router, minPrice, maxPrice, basePath]);

    // Filter products client-side
    let filteredProducts = [...initialProducts];

    // Filter by tag first
    if (selectedTag) {
        filteredProducts = filteredProducts.filter(p => {
            // Check if product has tags in attributes
            const tags = p.attributes?.tags || p.attributes?.Tags || p.attributes?.tag || p.attributes?.Tag;
            if (typeof tags === 'string') {
                // Tags might be comma-separated string
                return tags.toLowerCase().split(',').map((t: string) => t.trim()).includes(selectedTag.toLowerCase());
            } else if (Array.isArray(tags)) {
                // Tags might be array
                return tags.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase());
            }
            return false;
        });
    }

    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === selectedCategory);
    }

    if (selectedColors.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            const legacyColor = p.attributes?.color || p.attributes?.Color || p.attributes?.COLOR;
            if (legacyColor && selectedColors.includes(legacyColor)) return true;
            if (p.variants) {
                try {
                    const variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
                    return variants.some((v: any) => {
                        const vColor = v.attributes?.color || v.attributes?.Color || v.attributes?.COLOR || v.attributes?.Colour;
                        return vColor && selectedColors.includes(vColor);
                    });
                } catch (e) { return false; }
            }
            return false;
        });
    }

    if (selectedSizes.length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            // Check legacy attributes
            const legacySize = p.attributes?.size || p.attributes?.Size || p.attributes?.SIZE;
            if (legacySize && selectedSizes.includes(legacySize)) return true;

            // Check variants
            if (p.variants) {
                try {
                    const variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
                    return variants.some((v: any) => {
                        const vSize = v.attributes?.size || v.attributes?.Size || v.attributes?.SIZE;
                        return vSize && selectedSizes.includes(vSize);
                    });
                } catch (e) { return false; }
            }
            return false;
        });
    }

    filteredProducts = filteredProducts.filter(p => {
        const price = Number(p.price);
        return price >= priceRange[0] && price <= priceRange[1];
    });

    if (showInStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }

    if (minRating) {
        filteredProducts = filteredProducts.filter(p => (p.averageRating || 0) >= minRating);
    }

    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return Number(a.price) - Number(b.price);
            case 'price-desc':
                return Number(b.price) - Number(a.price);
            case 'name-asc':
                return a.name_en.localeCompare(b.name_en);
            case 'name-desc':
                return b.name_en.localeCompare(a.name_en);
            case 'newest':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Active Filters Count
    const activeFiltersCount = [
        selectedCategory,
        selectedColors.length > 0,
        selectedSizes.length > 0,
        showInStockOnly,
        showOffersOnly,
        minRating,
        priceRange[0] !== minPrice || priceRange[1] !== maxPrice
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md flex items-center justify-between gap-4 py-4 border-b border-border/10 mb-8 transition-all">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium hidden sm:block">
                    {filteredProducts.length} Results
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Filter Trigger Button */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-foreground/20 hover:border-foreground bg-background hover:bg-secondary/20 transition-all text-xs uppercase tracking-widest font-medium rounded-none group whitespace-nowrap"
                    >
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="bg-foreground text-background text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Sort Dropdown */}
                    <div className="flex-1 sm:flex-none">
                        <ProductSort value={sortBy} onChange={setSortBy} />
                    </div>
                </div>
            </div>

            {/* Products Grid - Full Width */}
            <ProductGrid
                products={filteredProducts}
                selectedColor={selectedColors.length > 0 ? selectedColors[0] : undefined}
            />

            {/* Filter Drawer */}
            <ProductFilters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categories={categories}
                selectedCategory={selectedCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                onCategoryChange={setSelectedCategory}
                showInStockOnly={showInStockOnly}
                onStockFilterChange={setShowInStockOnly}
                showOffersOnly={showOffersOnly}
                onOffersFilterChange={setShowOffersOnly}
                colors={availableColors}
                selectedColors={selectedColors}
                onColorChange={setSelectedColors}
                sizes={availableSizes}
                selectedSizes={selectedSizes}
                onSizeChange={setSelectedSizes}
                minRating={minRating}
                onRatingChange={setMinRating}
            />
        </div>
    );
}
