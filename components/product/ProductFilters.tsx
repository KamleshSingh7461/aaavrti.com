import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export interface ProductFiltersProps {
    categories: Array<{ id: string; name_en: string; slug: string }>;
    selectedCategory?: string;
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    onCategoryChange: (categoryId: string | undefined) => void;
    showInStockOnly: boolean;
    onStockFilterChange: (checked: boolean) => void;
    showOffersOnly: boolean;
    onOffersFilterChange: (checked: boolean) => void;
    colors?: string[];
    selectedColors?: string[];
    onColorChange?: (colors: string[]) => void;
    sizes?: string[];
    selectedSizes?: string[];
    onSizeChange?: (sizes: string[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductFilters({
    categories,
    selectedCategory,
    minPrice,
    maxPrice,
    priceRange,
    onPriceChange,
    onCategoryChange,
    showInStockOnly,
    onStockFilterChange,
    showOffersOnly,
    onOffersFilterChange,
    colors = [],
    selectedColors = [],
    onColorChange,
    sizes = [],
    selectedSizes = [],
    onSizeChange,
    isOpen,
    onClose
}: ProductFiltersProps) {

    const clearFilters = () => {
        onCategoryChange(undefined);
        onPriceChange([minPrice, maxPrice]);
        onStockFilterChange(false);
        onOffersFilterChange(false);
        onColorChange?.([]);
        onSizeChange?.([]);
    };

    const hasActiveFilters = selectedCategory || showInStockOnly || showOffersOnly ||
        (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) ||
        selectedColors.length > 0 || selectedSizes.length > 0;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="FILTER"
            description=""
            className="sm:max-w-md w-full"
        >
            <div className="flex flex-col h-full bg-background">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-thumb-secondary">
                    <div className="space-y-8 pb-24 pt-4">

                        <div className="space-y-4">
                            <Accordion type="multiple" defaultValue={['category']} className="w-full">
                                {/* Categories */}
                                <AccordionItem value="category" className="border-b-0">
                                    <AccordionTrigger className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:no-underline py-4">
                                        Category
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2 pb-4">
                                            <button
                                                onClick={() => onCategoryChange(undefined)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-none border-l-2 transition-all text-sm",
                                                    !selectedCategory
                                                        ? "border-primary bg-secondary/30 font-medium text-foreground"
                                                        : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                )}
                                            >
                                                All Categories
                                            </button>
                                            {categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => onCategoryChange(
                                                        selectedCategory === category.id ? undefined : category.id
                                                    )}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-none border-l-2 transition-all text-sm flex items-center justify-between",
                                                        selectedCategory === category.id
                                                            ? "border-primary bg-secondary/30 font-medium text-foreground"
                                                            : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                    )}
                                                >
                                                    {category.name_en}
                                                    {selectedCategory === category.id && <Check className="h-4 w-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <div className="h-px bg-border/20" />

                                {/* Price Range */}
                                <AccordionItem value="price" className="border-b-0">
                                    <AccordionTrigger className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:no-underline py-4">
                                        Price Range
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="px-2 pt-6 pb-2">
                                            <Slider
                                                min={minPrice}
                                                max={maxPrice}
                                                step={100}
                                                value={priceRange}
                                                onValueChange={(value) => onPriceChange(value as [number, number])}
                                                className="mb-6"
                                            />
                                            <div className="flex items-center justify-between font-serif text-lg">
                                                <span className="text-foreground">₹{priceRange[0].toLocaleString()}</span>
                                                <span className="text-muted-foreground">-</span>
                                                <span className="text-foreground">₹{priceRange[1].toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <div className="h-px bg-border/20" />

                                {/* Sizes */}
                                {sizes.length > 0 && onSizeChange && (
                                    <AccordionItem value="size" className="border-b-0">
                                        <AccordionTrigger className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:no-underline py-4">
                                            Size
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-wrap gap-3 pb-4">
                                                {sizes.map((size) => {
                                                    const isSelected = selectedSizes.includes(size);
                                                    return (
                                                        <button
                                                            key={size}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    onSizeChange(selectedSizes.filter(s => s !== size));
                                                                } else {
                                                                    onSizeChange([...selectedSizes, size]);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-12 h-12 flex items-center justify-center text-sm border transition-all duration-200",
                                                                isSelected
                                                                    ? "bg-foreground text-background border-foreground font-medium"
                                                                    : "bg-background text-foreground border-border hover:border-foreground"
                                                            )}
                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {colors.length > 0 && <div className="h-px bg-border/20" />}

                                {/* Colors */}
                                {colors.length > 0 && onColorChange && (
                                    <AccordionItem value="color" className="border-b-0">
                                        <AccordionTrigger className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:no-underline py-4">
                                            Color
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-5 gap-4 pb-4">
                                                {colors.map((color) => {
                                                    const isSelected = selectedColors.includes(color);
                                                    const colorMap: Record<string, string> = {
                                                        'red': 'bg-red-600', 'blue': 'bg-blue-600', 'green': 'bg-green-600',
                                                        'yellow': 'bg-yellow-500', 'black': 'bg-black', 'white': 'bg-white border-2 border-slate-200',
                                                        'pink': 'bg-pink-500', 'purple': 'bg-purple-600', 'orange': 'bg-orange-500',
                                                        'grey': 'bg-gray-500', 'gray': 'bg-gray-500', 'brown': 'bg-[#8B4513]',
                                                        'gold': 'bg-[#FFD700]', 'silver': 'bg-[#C0C0C0]', 'beige': 'bg-[#F5F5DC] border-2 border-slate-200',
                                                        'navy': 'bg-[#000080]', 'maroon': 'bg-[#800000]', 'cream': 'bg-[#FFFDD0] border-2 border-slate-200'
                                                    };
                                                    const bgClass = colorMap[color.toLowerCase()] || 'bg-gray-200';

                                                    return (
                                                        <div key={color} className="flex flex-col items-center gap-2 group cursor-pointer"
                                                            onClick={() => {
                                                                if (isSelected) onColorChange(selectedColors.filter(c => c !== color));
                                                                else onColorChange([...selectedColors, color]);
                                                            }}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-full transition-all duration-300 relative flex items-center justify-center",
                                                                bgClass,
                                                                isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "group-hover:scale-105"
                                                            )}>
                                                                {isSelected && <Check className={cn("w-5 h-5", ['white', 'beige', 'cream', 'yellow'].includes(color.toLowerCase()) ? "text-black" : "text-white")} />}
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">{color}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>

                            <div className="h-px bg-border/20" />

                            {/* Other Options */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Other</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="in-stock"
                                            checked={showInStockOnly}
                                            onCheckedChange={onStockFilterChange}
                                            className="h-5 w-5 rounded-none border-2"
                                        />
                                        <Label htmlFor="in-stock" className="text-base cursor-pointer font-normal">
                                            In Stock Only
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="offers"
                                            checked={showOffersOnly}
                                            onCheckedChange={onOffersFilterChange}
                                            className="h-5 w-5 rounded-none border-2"
                                        />
                                        <Label htmlFor="offers" className="text-base cursor-pointer font-normal">
                                            Special Offers Only
                                        </Label>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border/10 bg-background/80 backdrop-blur-md flex gap-4">
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="flex-1 py-3 border border-foreground/20 rounded-none text-sm uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-[2] py-3 bg-foreground text-background rounded-none text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors font-medium"
                        >
                            Show {hasActiveFilters ? 'Results' : 'Products'}
                        </button>
                    </div>
                </div>
            </div >
        </Drawer >
    );
}
