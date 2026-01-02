'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createOffer, updateOffer } from '@/actions/marketing-actions';
import { toast } from 'sonner';

interface OfferFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function OfferForm({ initialData, isEditing = false }: OfferFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        code: initialData?.code || '',
        type: initialData?.type || 'PERCENTAGE',
        value: initialData?.value || '',
        minAmount: initialData?.minAmount || '',
        maxDiscount: initialData?.maxDiscount || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(),
        usageLimit: initialData?.usageLimit || '',
        isActive: initialData?.isActive ?? true,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            value: Number(formData.value),
            minAmount: Number(formData.minAmount) || 0,
            maxDiscount: Number(formData.maxDiscount) || undefined,
            usageLimit: Number(formData.usageLimit) || undefined,
        };

        try {
            if (isEditing) {
                const res = await updateOffer(initialData._id, payload);
                if (res.error) throw new Error(res.error);
                toast.success('Offer updated successfully');
                router.push('/admin/marketing/offers');
            } else {
                const res = await createOffer(payload);
                if (res.error) throw new Error(res.error);
                toast.success('Offer created successfully');
                router.push('/admin/marketing/offers');
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Offer Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g. Summer Sale"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Internal notes or public description..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                placeholder="SUMMER2024"
                                className="uppercase font-mono"
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked: boolean) => handleChange('isActive', checked)}
                            />
                            <Label>Active Status</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Offer Value & Rules */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => handleChange('value', e.target.value)}
                                    placeholder={formData.type === 'PERCENTAGE' ? '20' : '500'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Order Value</Label>
                                <Input
                                    type="number"
                                    value={formData.minAmount}
                                    onChange={(e) => handleChange('minAmount', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Discount (Cap)</Label>
                                <Input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => handleChange('maxDiscount', e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Usage Limit (Total)</Label>
                            <Input
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) => handleChange('usageLimit', e.target.value)}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Validity Period */}
                <Card className="md:col-span-2">
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.startDate ? format(formData.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : new Date())}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="datetime-local"
                                required
                                value={formData.endDate ? format(formData.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : new Date())}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
