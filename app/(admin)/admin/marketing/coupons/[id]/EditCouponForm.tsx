'use client';

import { useState } from 'react';
import { updateCoupon } from '@/actions/coupon-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EditCouponFormProps {
    coupon: any;
}

export default function EditCouponForm({ coupon }: EditCouponFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Format dates for input[type="datetime-local"]
    // Removing the 'Z' and milliseconds to match datetime-local format: YYYY-MM-DDThh:mm
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minOrderValue: coupon.minOrderValue?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        validFrom: formatDate(coupon.validFrom),
        validUntil: formatDate(coupon.validUntil),
        description: coupon.description || '',
        active: coupon.active
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateCoupon(coupon.id, {
            code: formData.code,
            type: formData.type,
            value: parseFloat(formData.value),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            validFrom: new Date(formData.validFrom),
            validUntil: new Date(formData.validUntil),
            description: formData.description || undefined,
            active: formData.active
        });

        setLoading(false);

        if (result.success) {
            toast.success('Coupon updated successfully');
            router.push('/admin/marketing/coupons');
            router.refresh();
        } else {
            toast.error('Error updating coupon: ' + result.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/marketing/coupons">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold font-heading">Edit Coupon</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update coupon details and settings
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={formData.active}
                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
                        />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {formData.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 max-w-2xl">
                <div className="space-y-4">
                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Coupon Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-border rounded-md font-mono bg-muted/50"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Discount Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                        >
                            <option value="PERCENTAGE">Percentage Off</option>
                            <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                            <option value="FREE_SHIPPING">Free Shipping</option>
                        </select>
                    </div>

                    {/* Value */}
                    {formData.type !== 'FREE_SHIPPING' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {formData.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                            />
                        </div>
                    )}

                    {/* Min Order Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Minimum Order Value (₹)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.minOrderValue}
                            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                        />
                    </div>

                    {/* Max Discount */}
                    {formData.type === 'PERCENTAGE' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Maximum Discount Cap (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.maxDiscount}
                                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-md"
                                placeholder="No cap"
                            />
                        </div>
                    )}

                    {/* Usage Limit */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Usage Limit
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                            placeholder="Unlimited"
                        />
                    </div>

                    {/* Valid From */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Valid From <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.validFrom}
                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                        />
                    </div>

                    {/* Valid Until */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Valid Until <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.validUntil}
                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md"
                            rows={3}
                        />
                    </div>

                </div>

                <div className="flex gap-3 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Link href="/admin/marketing/coupons">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
