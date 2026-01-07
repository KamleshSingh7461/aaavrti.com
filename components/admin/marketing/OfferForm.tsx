'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2, Plus, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createOffer, updateOffer } from '@/actions/offer-actions';
import { toast } from 'sonner';
import { CategorySelector } from './CategorySelector';
import { ProductSelector } from './ProductSelector';

interface OfferFormProps {
    initialData?: any;
    isEditing?: boolean;
}

const OFFER_TYPES = [
    { value: 'PERCENTAGE', label: 'Percentage Discount', description: 'e.g., 20% off' },
    { value: 'FIXED', label: 'Fixed Amount Off', description: 'e.g., ₹500 off' },
    { value: 'BUNDLE', label: 'Bundle Offer', description: 'e.g., Buy 3 @ ₹1999' },
    { value: 'BOGO', label: 'Buy X Get Y', description: 'e.g., Buy 2 Get 1 Free' },
    { value: 'MIX_MATCH', label: 'Mix & Match', description: 'e.g., Any 3 from category @ ₹2500' },
    { value: 'QUANTITY_DISCOUNT', label: 'Quantity Discount', description: 'e.g., 3 of ₹999 each @ ₹2200' },
    { value: 'TIERED', label: 'Tiered Pricing', description: 'e.g., Buy 2 get 10% off, Buy 3 get 20% off' },
];

const APPLICABLE_TYPES = [
    { value: 'ALL', label: 'All Products' },
    { value: 'CATEGORY', label: 'Specific Categories' },
    { value: 'PRODUCT', label: 'Specific Products' },
    { value: 'PRICE_RANGE', label: 'Price Range' },
    { value: 'COMBINED', label: 'Category + Price Range' },
];

export function OfferForm({ initialData, isEditing = false }: OfferFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        code: initialData?.code || '',
        name: initialData?.name || '',
        type: initialData?.type || 'PERCENTAGE',
        value: initialData?.value || '',
        minAmount: initialData?.minAmount || '',
        maxDiscount: initialData?.maxDiscount || '',

        // Bundle/BOGO fields
        bundleQuantity: initialData?.bundleQuantity || '',
        bundlePrice: initialData?.bundlePrice || '',
        buyQuantity: initialData?.buyQuantity || '',
        getQuantity: initialData?.getQuantity || '',
        getDiscount: initialData?.getDiscount || '100',

        // Tiered pricing
        tiers: initialData?.tiers ? JSON.parse(initialData.tiers) : [{ quantity: 2, discount: 10 }],

        // Targeting
        applicableType: initialData?.applicableType || 'ALL',
        applicableIds: initialData?.applicableIds ? JSON.parse(initialData.applicableIds) : [],
        minPrice: initialData?.minPrice || '',
        maxPrice: initialData?.maxPrice || '',

        // Display
        badgeText: initialData?.badgeText || '',
        priority: initialData?.priority || '0',

        // Validity
        startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: initialData?.usageLimit || '',
        isActive: initialData?.isActive ?? true,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            tiers: [...prev.tiers, { quantity: 0, discount: 0 }]
        }));
    };

    const removeTier = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateTier = (index: number, field: 'quantity' | 'discount', value: number) => {
        setFormData(prev => ({
            ...prev,
            tiers: prev.tiers.map((tier: any, i: number) =>
                i === index ? { ...tier, [field]: value } : tier
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload: any = {
            title: formData.title,
            description: formData.description,
            code: formData.code.toUpperCase(),
            name: formData.name,
            type: formData.type,
            value: Number(formData.value),
            minAmount: Number(formData.minAmount) || 0,
            maxDiscount: Number(formData.maxDiscount) || undefined,
            applicableType: formData.applicableType,
            applicableIds: JSON.stringify(formData.applicableIds),
            badgeText: formData.badgeText,
            priority: Number(formData.priority),
            startDate: formData.startDate,
            endDate: formData.endDate,
            usageLimit: Number(formData.usageLimit) || undefined,
            isActive: formData.isActive,
        };

        // Add type-specific fields
        if (['BUNDLE', 'MIX_MATCH', 'QUANTITY_DISCOUNT'].includes(formData.type)) {
            payload.bundleQuantity = Number(formData.bundleQuantity);
            payload.bundlePrice = Number(formData.bundlePrice);
        }

        if (formData.type === 'BOGO') {
            payload.buyQuantity = Number(formData.buyQuantity);
            payload.getQuantity = Number(formData.getQuantity);
            payload.getDiscount = Number(formData.getDiscount);
        }

        if (formData.type === 'TIERED') {
            payload.tiers = JSON.stringify(formData.tiers);
        }

        if (['PRICE_RANGE', 'COMBINED'].includes(formData.applicableType)) {
            payload.minPrice = Number(formData.minPrice) || undefined;
            payload.maxPrice = Number(formData.maxPrice) || undefined;
        }

        try {
            if (isEditing) {
                const res = await updateOffer(initialData._id, payload);
                if (!res.success) throw new Error(res.error);
                toast.success('Offer updated successfully');
            } else {
                const res = await createOffer(payload);
                if (!res.success) throw new Error(res.error);
                toast.success('Offer created successfully');
            }
            router.push('/admin/marketing/offers');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save offer');
        } finally {
            setIsLoading(false);
        }
    };

    // Show/hide fields based on offer type
    const showBundleFields = ['BUNDLE', 'MIX_MATCH', 'QUANTITY_DISCOUNT'].includes(formData.type);
    const showBOGOFields = formData.type === 'BOGO';
    const showTieredFields = formData.type === 'TIERED';
    const showSimpleDiscountFields = ['PERCENTAGE', 'FIXED'].includes(formData.type);
    const showPriceRangeFields = ['PRICE_RANGE', 'COMBINED'].includes(formData.applicableType);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>General details about the offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Offer Code *</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                placeholder="SUMMER2024"
                                className="uppercase font-mono"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Unique code customers will use</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Summer Sale 2024"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g. Summer Sale - 20% Off"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the offer details..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Badge Text (Optional)</Label>
                        <Input
                            value={formData.badgeText}
                            onChange={(e) => handleChange('badgeText', e.target.value)}
                            placeholder="Auto-generated if empty"
                        />
                        <p className="text-xs text-muted-foreground">Custom text to show on product badges</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleChange('isActive', checked)}
                        />
                        <Label>Active</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Offer Type & Value */}
            <Card>
                <CardHeader>
                    <CardTitle>Offer Type & Discount</CardTitle>
                    <CardDescription>Choose the type of offer and configure its value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Offer Type *</Label>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            {OFFER_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label} - {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Simple Discount Fields (PERCENTAGE, FIXED) */}
                    {showSimpleDiscountFields && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Value *</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => handleChange('value', e.target.value)}
                                    placeholder={formData.type === 'PERCENTAGE' ? '20' : '500'}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.type === 'PERCENTAGE' ? 'Percentage (e.g., 20 for 20%)' : 'Amount in ₹'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Discount Cap</Label>
                                <Input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => handleChange('maxDiscount', e.target.value)}
                                    placeholder="Optional"
                                />
                                <p className="text-xs text-muted-foreground">Maximum discount amount in ₹</p>
                            </div>
                        </div>
                    )}

                    {/* Bundle Fields (BUNDLE, MIX_MATCH, QUANTITY_DISCOUNT) */}
                    {showBundleFields && (
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-2">
                                <Label>Bundle Quantity *</Label>
                                <Input
                                    type="number"
                                    value={formData.bundleQuantity}
                                    onChange={(e) => handleChange('bundleQuantity', e.target.value)}
                                    placeholder="3"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Number of items in bundle</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Bundle Price *</Label>
                                <Input
                                    type="number"
                                    value={formData.bundlePrice}
                                    onChange={(e) => handleChange('bundlePrice', e.target.value)}
                                    placeholder="1999"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Total price for bundle in ₹</p>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                                    <Info className="w-4 h-4 mt-0.5 text-blue-600" />
                                    <p className="text-xs text-blue-900 dark:text-blue-100">
                                        Example: Set quantity to 3 and price to ₹1999 for "Buy 3 @ ₹1999"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BOGO Fields */}
                    {showBOGOFields && (
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-2">
                                <Label>Buy Quantity *</Label>
                                <Input
                                    type="number"
                                    value={formData.buyQuantity}
                                    onChange={(e) => handleChange('buyQuantity', e.target.value)}
                                    placeholder="2"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Get Quantity *</Label>
                                <Input
                                    type="number"
                                    value={formData.getQuantity}
                                    onChange={(e) => handleChange('getQuantity', e.target.value)}
                                    placeholder="1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Discount % *</Label>
                                <Input
                                    type="number"
                                    value={formData.getDiscount}
                                    onChange={(e) => handleChange('getDiscount', e.target.value)}
                                    placeholder="100"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">100 = Free</p>
                            </div>
                            <div className="col-span-3">
                                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                                    <Info className="w-4 h-4 mt-0.5 text-green-600" />
                                    <p className="text-xs text-green-900 dark:text-green-100">
                                        Example: Buy 2, Get 1, Discount 100% = "Buy 2 Get 1 Free"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tiered Pricing */}
                    {showTieredFields && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center justify-between">
                                <Label>Pricing Tiers</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addTier}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Tier
                                </Button>
                            </div>
                            {formData.tiers.map((tier: any, index: number) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Quantity</Label>
                                        <Input
                                            type="number"
                                            value={tier.quantity}
                                            onChange={(e) => updateTier(index, 'quantity', Number(e.target.value))}
                                            placeholder="2"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Discount %</Label>
                                        <Input
                                            type="number"
                                            value={tier.discount}
                                            onChange={(e) => updateTier(index, 'discount', Number(e.target.value))}
                                            placeholder="10"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeTier(index)}
                                        disabled={formData.tiers.length === 1}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-md">
                                <Info className="w-4 h-4 mt-0.5 text-purple-600" />
                                <p className="text-xs text-purple-900 dark:text-purple-100">
                                    Example: Qty 2 = 10%, Qty 3 = 20% means "Buy 2 get 10% off, Buy 3 get 20% off"
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Minimum Order Value</Label>
                        <Input
                            type="number"
                            value={formData.minAmount}
                            onChange={(e) => handleChange('minAmount', e.target.value)}
                            placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">Minimum cart value required to apply offer</p>
                    </div>
                </CardContent>
            </Card>

            {/* Targeting */}
            <Card>
                <CardHeader>
                    <CardTitle>Targeting</CardTitle>
                    <CardDescription>Choose which products this offer applies to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Apply To *</Label>
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={formData.applicableType}
                            onChange={(e) => handleChange('applicableType', e.target.value)}
                        >
                            {APPLICABLE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {showPriceRangeFields && (
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-2">
                                <Label>Min Price</Label>
                                <Input
                                    type="number"
                                    value={formData.minPrice}
                                    onChange={(e) => handleChange('minPrice', e.target.value)}
                                    placeholder="999"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Price</Label>
                                <Input
                                    type="number"
                                    value={formData.maxPrice}
                                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                                    placeholder="2999"
                                />
                            </div>
                        </div>
                    )}

                    {formData.applicableType === 'CATEGORY' && (
                        <div className="p-4 border rounded-lg">
                            <CategorySelector
                                selectedIds={formData.applicableIds}
                                onChange={(ids) => handleChange('applicableIds', ids)}
                            />
                        </div>
                    )}

                    {formData.applicableType === 'PRODUCT' && (
                        <div className="p-4 border rounded-lg">
                            <ProductSelector
                                selectedIds={formData.applicableIds}
                                onChange={(ids) => handleChange('applicableIds', ids)}
                            />
                        </div>
                    )}

                    {formData.applicableType === 'COMBINED' && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <CategorySelector
                                    selectedIds={formData.applicableIds}
                                    onChange={(ids) => handleChange('applicableIds', ids)}
                                />
                            </div>
                            {showPriceRangeFields && (
                                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                                    <div className="space-y-2">
                                        <Label>Min Price</Label>
                                        <Input
                                            type="number"
                                            value={formData.minPrice}
                                            onChange={(e) => handleChange('minPrice', e.target.value)}
                                            placeholder="999"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Price</Label>
                                        <Input
                                            type="number"
                                            value={formData.maxPrice}
                                            onChange={(e) => handleChange('maxPrice', e.target.value)}
                                            placeholder="2999"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Validity & Limits */}
            <Card>
                <CardHeader>
                    <CardTitle>Validity & Limits</CardTitle>
                    <CardDescription>Set when and how often this offer can be used</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.startDate ? format(formData.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : new Date())}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.endDate ? format(formData.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : new Date())}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) => handleChange('usageLimit', e.target.value)}
                                placeholder="Leave empty for unlimited"
                            />
                            <p className="text-xs text-muted-foreground">Total number of times offer can be used</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">Higher priority offers shown first</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Offer' : 'Create Offer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
