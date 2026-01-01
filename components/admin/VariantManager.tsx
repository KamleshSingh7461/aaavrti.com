'use client';

import { useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { VariantImageDialog } from './VariantImageDialog';

interface GlobalAttribute {
    id: string;
    name: string;
    type: string;
    values: { id: string; name: string; value: string }[];
}

export interface Variant {
    id: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    image?: string; // Deprecated
    images?: string[]; // New multi-image support
}

interface VariantManagerProps {
    globalAttributes: GlobalAttribute[];
    variants: Variant[];
    basePrice: number;
    baseSku: string;
    productImages: string[];
    onChange: (variants: Variant[]) => void;
    onPoolChange: (images: string[]) => void;
}

export function VariantManager({ globalAttributes, variants, basePrice, baseSku, productImages, onChange, onPoolChange }: VariantManagerProps) {
    // --- Setup Mode State ---
    const [setupAttrId, setSetupAttrId] = useState<string>('');
    const [setupValue, setSetupValue] = useState<string>('');
    const [isSetupMode, setIsSetupMode] = useState(variants.length === 0);

    // --- Generator State ---
    const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);
    const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});

    // If variants exist, we are not in setup mode
    if (variants.length > 0 && isSetupMode) {
        setIsSetupMode(false);
    }

    // --- Setup Handlers ---
    const handleInitializeBase = () => {
        if (!setupAttrId || !setupValue) return;
        const attr = globalAttributes.find(a => a.id === setupAttrId);
        if (!attr) return;

        const suffix = setupValue.slice(0, 3).toUpperCase();
        const baseVariant: Variant = {
            id: crypto.randomUUID(),
            sku: baseSku ? `${baseSku}-${suffix}` : `VAR-${suffix}`,
            price: basePrice,
            stock: 0, // Will be managed here
            attributes: { [attr.name]: setupValue },
            images: []
        };

        onChange([baseVariant]);
        setIsSetupMode(false);
        // Pre-select this attribute for generator convenience
        setSelectedAttrIds([setupAttrId]);
    };

    // --- Generator Handlers ---
    const handleAttrSelect = (attrId: string) => {
        if (!selectedAttrIds.includes(attrId)) {
            setSelectedAttrIds([...selectedAttrIds, attrId]);
            setSelectedValues({ ...selectedValues, [attrId]: [] });
        }
    };

    const handleValueToggle = (attrId: string, valueName: string) => {
        const currentValues = selectedValues[attrId] || [];
        const newValues = currentValues.includes(valueName)
            ? currentValues.filter(v => v !== valueName)
            : [...currentValues, valueName];

        setSelectedValues({ ...selectedValues, [attrId]: newValues });
    };

    const generateVariants = () => {
        if (selectedAttrIds.length === 0) return;
        const activeAttrs = selectedAttrIds.filter(id => (selectedValues[id]?.length || 0) > 0);
        if (activeAttrs.length === 0) return;

        let combinations: Record<string, string>[] = [{}];

        activeAttrs.forEach(attrId => {
            const attr = globalAttributes.find(a => a.id === attrId);
            if (!attr) return;
            const values = selectedValues[attrId];
            const newCombinations: Record<string, string>[] = [];
            combinations.forEach(existingCombo => {
                values.forEach(val => {
                    newCombinations.push({ ...existingCombo, [attr.name]: val });
                });
            });
            combinations = newCombinations;
        });

        // Convert combinations to Variants
        const newVariants: Variant[] = [];

        combinations.forEach((combo, index) => {
            // Check if this combination already exists
            const exists = variants.some(v =>
                JSON.stringify(v.attributes) === JSON.stringify(combo)
            );

            if (!exists) {
                const skuSuffix = Object.values(combo)
                    .map(v => v.slice(0, 3).toUpperCase())
                    .join('-');

                newVariants.push({
                    id: crypto.randomUUID(),
                    sku: baseSku ? `${baseSku}-${skuSuffix}` : `VAR-${variants.length + index + 1}`,
                    price: basePrice || 0,
                    stock: 0,
                    attributes: combo,
                    images: []
                });
            }
        });

        if (newVariants.length > 0) {
            onChange([...variants, ...newVariants]);
        }
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        const updated = variants.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        );
        onChange(updated);
    };

    const removeVariant = (id: string) => onChange(variants.filter(v => v.id !== id));

    // --- Render Setup Mode ---
    if (isSetupMode) {
        return (
            <div className="space-y-6 animate-in fade-in-50">
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-primary">Initialize Product Variants</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        To enable variants, you must first define the <strong>Main Product's</strong> attribute.
                        For example, if this is a Red Shirt, select "Color" and enter "Red".
                    </p>

                    <div className="flex gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Attribute Type</label>
                            <select
                                value={setupAttrId}
                                onChange={(e) => setSetupAttrId(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                            >
                                <option value="">Select Attribute...</option>
                                {globalAttributes.map(attr => (
                                    <option key={attr.id} value={attr.id}>{attr.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Usage for Main Product</label>
                            {setupAttrId ? (
                                <select
                                    value={setupValue}
                                    onChange={(e) => setSetupValue(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                                >
                                    <option value="">Select Value...</option>
                                    {globalAttributes.find(a => a.id === setupAttrId)?.values.map(val => (
                                        <option key={val.id} value={val.name}>{val.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input disabled className="w-full px-3 py-2 rounded-md border border-border bg-secondary cursor-not-allowed" placeholder="Select attribute first" />
                            )}
                        </div>
                        <button
                            onClick={handleInitializeBase}
                            disabled={!setupAttrId || !setupValue}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            Set Main Product
                        </button>
                    </div>
                </div>

                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Or skip variants to create a simple product.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* Generator Section */}
            <div className="bg-secondary/20 p-5 rounded-lg border border-border space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Variant Generator</h3>
                </div>

                <div className="space-y-4">
                    {/* 1. Choose Attributes */}
                    <div className="flex gap-2 flex-wrap">
                        {globalAttributes.map(attr => (
                            <button
                                key={attr.id}
                                type="button"
                                onClick={() => handleAttrSelect(attr.id)}
                                disabled={selectedAttrIds.includes(attr.id)}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-all ${selectedAttrIds.includes(attr.id)
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-background border-border hover:border-primary/50'
                                    }`}
                            >
                                {attr.name}
                            </button>
                        ))}
                    </div>

                    {/* 2. Select Values */}
                    {selectedAttrIds.map(attrId => {
                        const attr = globalAttributes.find(a => a.id === attrId);
                        if (!attr) return null;
                        return (
                            <div key={attrId} className="bg-background/50 p-3 rounded-md border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{attr.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedAttrIds(prev => prev.filter(id => id !== attrId));
                                            const newValues = { ...selectedValues };
                                            delete newValues[attrId];
                                            setSelectedValues(newValues);
                                        }}
                                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map(val => (
                                        <button
                                            key={val.id}
                                            type="button"
                                            onClick={() => handleValueToggle(attrId, val.name)}
                                            className={`px-2.5 py-1 text-xs rounded border transition-colors ${selectedValues[attrId]?.includes(val.name)
                                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                                : 'bg-background border-border hover:border-primary/50 text-muted-foreground'
                                                }`}
                                        >
                                            {val.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {selectedAttrIds.length > 0 && (
                        <button
                            type="button"
                            onClick={generateVariants}
                            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Generate Variants Configuration
                        </button>
                    )}
                </div>
            </div>

            {/* Variants Table */}
            {variants.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/40 border-b border-border text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="p-3 text-left font-medium w-[25%]">Variant Details</th>
                                <th className="p-3 text-left font-medium w-[25%]">Images</th>
                                <th className="p-3 text-left font-medium w-[20%]">SKU</th>
                                <th className="p-3 text-left font-medium w-[15%]">Price/Stock</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {variants.map(variant => (
                                <tr key={variant.id} className="group hover:bg-secondary/10 transition-colors">
                                    <td className="p-3 align-top">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(variant.attributes).map(([key, val]) => (
                                                <span key={key} className="px-2 py-1 bg-secondary rounded text-xs font-medium border border-border">
                                                    {val}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 align-top">
                                        <VariantImageDialog
                                            productImages={productImages}
                                            variantImages={variant.images || (variant.image ? [variant.image] : [])}
                                            onVariantImagesChange={(imgs) => updateVariant(variant.id, 'images', imgs)}
                                            onPoolChange={onPoolChange}
                                        />
                                    </td>
                                    <td className="p-3 align-top">
                                        <input
                                            type="text"
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                            className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="SKU"
                                        />
                                    </td>
                                    <td className="p-3 align-top space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-8">₹</span>
                                            <input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                min="0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-8">Qty</span>
                                            <input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                min="0"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3 align-top text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(variant.id)}
                                            className="text-muted-foreground hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-secondary/5">
                    <p className="text-sm text-muted-foreground">
                        Configure attributes above and click "Generate" to create variants.
                    </p>
                </div>
            )}
        </div>
    );
}
