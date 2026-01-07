'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Package, Image as ImageIcon, Layers, FileText } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { CategorySelector } from './CategorySelector';
import { VariantManager, type Variant } from './VariantManager';
import { createProduct, updateProduct } from '@/actions/product-actions';
import type { ProductWithCategory } from '@/actions/product-actions';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductFormProps {
    product?: ProductWithCategory | null;
    categories: Category[];
    attributes: any[];
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'variants', label: 'Variants', icon: Layers },
    { id: 'review', label: 'Review', icon: FileText },
];

export function ProductForm({ product, categories, attributes, onClose, onSuccess }: ProductFormProps) {
    const isEdit = !!product;
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Form State ---
    // Basic
    const [name_en, setNameEn] = useState(product?.name_en || '');
    const [name_hi, setNameHi] = useState(product?.name_hi || '');
    const [description_en, setDescriptionEn] = useState(product?.description_en || '');
    const [description_hi, setDescriptionHi] = useState(product?.description_hi || '');
    const [categoryId, setCategoryId] = useState(product?.category.id || '');
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice?.toString() || '');
    const [stock, setStock] = useState(product?.stock.toString() || '0');
    const [sku, setSku] = useState(product?.sku || '');
    const [status, setStatus] = useState(product?.status || 'DRAFT');
    const [featured, setFeatured] = useState(product?.featured || false);
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        if (!product?.attributes) return [];
        try {
            const attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
            const productTags = attrs.tags || attrs.Tags;
            if (Array.isArray(productTags)) return productTags;
            if (typeof productTags === 'string') return productTags.split(',').map(t => t.trim());
            return [];
        } catch {
            return [];
        }
    });

    // Get tags from attributes
    const tagsAttribute = attributes.find(attr => attr.name === 'Tags' || attr.name === 'tags');
    const availableTags = tagsAttribute?.values || [];

    // Media
    const [images, setImages] = useState<string[]>(product?.images || []);

    // Variants
    const [variants, setVariants] = useState<Variant[]>(product?.variants ? JSON.parse(product.variants) : []);

    // SEO
    const [metaTitle, setMetaTitle] = useState(product?.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(product?.meta_description || '');

    // Attributes (Product Specifics)
    const [formAttributes, setFormAttributes] = useState<Record<string, string>>(() => {
        if (!product?.attributes) return {};
        try {
            return typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
        } catch (e) { return {}; }
    });

    // --- Validation ---
    const validateStep = (stepIdx: number): boolean => {
        setError('');
        if (stepIdx === 0) { // Basic
            if (!name_en) { setError('Product Name (English) is required'); return false; }
            if (!description_en) { setError('Description (English) is required'); return false; }
            if (!categoryId) { setError('Category is required'); return false; }
            if (!price || Number(price) < 0) { setError('Valid Price is required'); return false; }
            return true;
        }
        if (stepIdx === 1) { // Media
            if (images.length === 0) { setError('At least one product image is required'); return false; }
            return true;
        }
        if (stepIdx === 2) { // Variants
            // Variants are optional, but if present, check them?
            // For now, allow no variants (simple product)
            return true;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('name_en', name_en);
        formData.append('name_hi', name_hi || '');
        formData.append('description_en', description_en);
        formData.append('description_hi', description_hi || '');
        formData.append('categoryId', categoryId);
        formData.append('price', price);
        formData.append('compareAtPrice', compareAtPrice);
        formData.append('stock', stock);
        formData.append('sku', sku);
        formData.append('status', status);
        formData.append('featured', featured.toString());
        formData.append('meta_title', metaTitle || name_en);
        formData.append('meta_description', metaDescription || description_en.slice(0, 160));
        formData.append('images', JSON.stringify(images));
        formData.append('variants', JSON.stringify(variants));

        // Remove empty keys from attributes before saving
        const cleanAttributes: Record<string, any> = Object.fromEntries(
            Object.entries(formAttributes).filter(([k, v]) => k.trim() !== '' && k.toLowerCase() !== 'tags')
        );

        // Add tags to attributes (always, even if empty array)
        cleanAttributes.tags = selectedTags;

        console.log('Saving tags:', selectedTags);
        console.log('Clean attributes:', cleanAttributes);

        formData.append('attributes', JSON.stringify(cleanAttributes));

        try {
            const result = isEdit
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals for review
    const totalVariantStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    const effectiveStock = variants.length > 0 ? totalVariantStock : Number(stock);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
                    <div>
                        <h2 className="text-lg font-semibold">{isEdit ? 'Edit Product' : 'Create New Product'}</h2>
                        <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between px-12 py-4 bg-secondary/20 border-b border-border">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isActive ? "border-primary bg-primary text-primary-foreground shadow-md scale-110" :
                                        isCompleted ? "border-primary bg-primary/10 text-primary" :
                                            "border-border bg-background text-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium mt-2 transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}>{step.label}</span>

                                {/* Connector Line */}
                                {idx !== STEPS.length - 1 && (
                                    <div className={cn(
                                        "absolute top-5 left-[50%] w-[calc(100%+20px)] h-[2px] -z-10",
                                        idx < currentStep ? "bg-primary" : "bg-border"
                                    )} style={{ left: '60%' }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-secondary/5">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <X className="h-5 w-5" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                        <div className="space-y-6 max-w-3xl mx-auto animate-in slide-in-from-right-4 fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name (English) <span className="text-red-500">*</span></label>
                                    <input value={name_en} onChange={e => setNameEn(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Silk Saree" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name (Hindi)</label>
                                    <input value={name_hi} onChange={e => setNameHi(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. सिल्क साड़ी" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description (English) <span className="text-red-500">*</span></label>
                                <textarea value={description_en} onChange={e => setDescriptionEn(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none resize-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                                    <CategorySelector categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Base SKU</label>
                                    <input value={sku} onChange={e => setSku(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. BASE-001" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (₹) <span className="text-red-500">*</span></label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" min="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">MRP / Compare At</label>
                                    <input type="number" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" min="0" placeholder="e.g. 5000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Base Stock</label>
                                    <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" min="0" disabled={variants.length > 0} title={variants.length > 0 ? "Managed by variants" : ""} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none">
                                        <option value="DRAFT">Draft</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-4 border border-border rounded-lg bg-card">
                                <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Mark as Featured Product</label>
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium">Collection Tags</label>
                                <div className="grid grid-cols-2 gap-3 p-4 border border-border rounded-md bg-secondary/5">
                                    {availableTags.length > 0 ? (
                                        availableTags.map((tag: any) => (
                                            <label key={tag.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/20 p-2 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTags.includes(tag.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTags([...selectedTags, tag.value]);
                                                        } else {
                                                            setSelectedTags(selectedTags.filter(t => t !== tag.value));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">{tag.name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground col-span-2">No tags available. Create tags in Attributes page first.</p>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Select tags to categorize this product in collections</p>
                            </div>

                            {/* Product Specifics (Attributes) */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                <h3 className="text-sm font-medium">Product Specifics</h3>
                                <div className="space-y-3">
                                    {Object.entries(formAttributes).map(([key, value], idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                placeholder="Key (e.g. Material)"
                                                value={key}
                                                onChange={e => {
                                                    const newAttrs = { ...formAttributes };
                                                    const val = newAttrs[key];
                                                    delete newAttrs[key];
                                                    newAttrs[e.target.value] = val;
                                                    setFormAttributes(newAttrs);
                                                }}
                                                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
                                            />
                                            <input
                                                placeholder="Value (e.g. Cotton)"
                                                value={value}
                                                onChange={e => {
                                                    setFormAttributes({ ...formAttributes, [key]: e.target.value });
                                                }}
                                                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newAttrs = { ...formAttributes };
                                                    delete newAttrs[key];
                                                    setFormAttributes(newAttrs);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setFormAttributes({ ...formAttributes, '': '' })}
                                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                                    >
                                        + Add Specification
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Media */}
                    {currentStep === 1 && (
                        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                                <h3 className="text-lg font-medium mb-2">Product Gallery</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Upload high-quality images. The first image will be used as the thumbnail.
                                    These images will be available for all variants.
                                </p>
                                <ImageUploader images={images} onChange={setImages} maxImages={8} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Variants */}
                    {currentStep === 2 && (
                        <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 fade-in">
                            <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium">Product Variants</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Create variants for Size, Color, Material, etc.
                                        Images added here will be linked to specific variants.
                                    </p>
                                </div>

                                <VariantManager
                                    globalAttributes={attributes}
                                    variants={variants}
                                    basePrice={Number(price) || 0}
                                    baseSku={sku}
                                    productImages={images}
                                    onPoolChange={setImages}
                                    onChange={setVariants}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 3 && (
                        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <div className="grid gap-6">
                                {/* Summary Card */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Product Summary</h3>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>
                                            <p className="font-medium">{name_en}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Price:</span>
                                            <p className="font-medium">₹{price}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Category:</span>
                                            <p className="font-medium">{categories.find(c => c.id === categoryId)?.name_en || categoryId}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Stock:</span>
                                            <p className="font-medium">{effectiveStock} units</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Images:</span>
                                            <p className="font-medium">{images.length} images</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Variants:</span>
                                            <p className="font-medium">{variants.length > 0 ? `${variants.length} variants configured` : 'No variants (Simple Product)'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SEO Helper */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">SEO Settings (Optional)</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Meta Title</label>
                                            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder={name_en} />
                                            <p className="text-xs text-muted-foreground">Defaults to product name if empty.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Meta Description</label>
                                            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder={description_en.slice(0, 160)} />
                                            <p className="text-xs text-muted-foreground">Defaults to first 160 chars of description if empty.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Controls */}
                <div className="p-4 border-t border-border bg-card flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0 || loading}
                        className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="flex gap-2">
                        {currentStep < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                            >
                                Next Step
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>{isEdit ? 'Update Product' : 'Publish Product'} <Check className="h-4 w-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
