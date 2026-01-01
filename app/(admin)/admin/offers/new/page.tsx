
'use client';

import { useState } from 'react';
import { createOffer } from '@/actions/offer-actions';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { TargetingSelector } from '@/components/admin/TargetingSelector';

export default function NewOfferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        minAmount: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        applicableType: 'ALL',
        applicableIds: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            value: Number(formData.value),
            minAmount: formData.minAmount ? Number(formData.minAmount) : undefined,
            maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
            startDate: formData.startDate ? new Date(formData.startDate) : undefined,
            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        };

        const result = await createOffer(payload);

        if (result.success) {
            toast({ title: 'Offer Created Successfully' });
            router.push('/offers');
        } else {
            toast({ title: result.error || 'Failed to create offer', variant: 'destructive' });
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/offers" className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Create New Offer</h1>
                    <p className="text-sm text-muted-foreground">Set up a discount code</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Coupon Code *</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. SUMMER25"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 uppercase font-mono tracking-wider focus:ring-1 focus:ring-primary outline-none"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Discount Type *</label>
                        <select
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Discount Value *</label>
                        <input
                            required
                            type="number"
                            min="0"
                            placeholder={formData.type === 'PERCENTAGE' ? "e.g. 20" : "e.g. 500"}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                        />
                    </div>
                    {formData.type === 'PERCENTAGE' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Discount Amount (Optional)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Cap the discount amount"
                                className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                                value={formData.maxDiscount}
                                onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Order Amount</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 1000"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.minAmount}
                            onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Usage Limit (Total)</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Max total uses"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.usageLimit}
                            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Applicable To</label>
                    <select
                        className="w-full bg-background border border-border rounded-md px-3 py-2 outline-none"
                        value={formData.applicableType}
                        onChange={e => setFormData({ ...formData, applicableType: e.target.value })}
                    >
                        <option value="ALL">All Products</option>
                        <option value="CATEGORY">Specific Categories</option>
                        <option value="PRODUCT">Specific Products</option>
                    </select>

                    <TargetingSelector
                        type={formData.applicableType}
                        selectedIds={formData.applicableIds}
                        onChange={(ids) => setFormData({ ...formData, applicableIds: ids })}
                    />
                </div>

                <div className="pt-4  flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Offer
                    </button>
                </div>
            </form>
        </div>
    );
}
