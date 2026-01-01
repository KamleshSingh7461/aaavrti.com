
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createOffer, getOffer, updateOffer } from '@/actions/offer-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function OfferFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE', // PERCENTAGE or FIXED
        value: 0,
        minAmount: 0,
        maxDiscount: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        if (!isNew) {
            loadOffer();
        }
    }, [id]);

    const loadOffer = async () => {
        const offer = await getOffer(id);
        if (!offer) {
            toast({ title: 'Offer not found', variant: 'destructive' });
            router.push('/admin/offers');
            return;
        }
        setFormData({
            code: offer.code,
            type: offer.type,
            value: offer.value,
            minAmount: offer.minAmount || 0,
            maxDiscount: offer.maxDiscount || 0,
            usageLimit: offer.usageLimit || 0,
            startDate: offer.startDate || '',
            endDate: offer.endDate || '',
            title: (offer as any).title || '',
            description: (offer as any).description || ''
        });
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let result;
        if (isNew) {
            result = await createOffer(formData);
        } else {
            result = await updateOffer(id, formData);
        }

        if (result.success) {
            toast({ title: isNew ? 'Offer created' : 'Offer updated' });
            router.push('/admin/offers');
            router.refresh();
        } else {
            toast({ title: result.error || 'Failed to save offer', variant: 'destructive' });
        }
        setSaving(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Convert numbers
        if (['value', 'minAmount', 'maxDiscount', 'usageLimit'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/offers" className="p-2 hover:bg-secondary rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold font-heading">{isNew ? 'Create New Offer' : 'Edit Offer'}</h1>
                    <p className="text-sm text-muted-foreground">Configure discount codes and flash sales</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card border p-6 rounded-lg space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                className="w-full p-2 border rounded-md bg-background font-mono uppercase"
                                placeholder="SUMMER50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (₹)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Value ({formData.type === 'PERCENTAGE' ? '%' : '₹'})</label>
                            <input
                                type="number"
                                name="value"
                                required
                                min="0"
                                value={formData.value}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min Order Amount (₹)</label>
                            <input
                                type="number"
                                name="minAmount"
                                min="0"
                                value={formData.minAmount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                            />
                        </div>
                        {formData.type === 'PERCENTAGE' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    min="0"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md bg-background"
                                    placeholder="Leave 0 for unlimited"
                                />
                            </div>
                        )}
                    </div>

                    {/* Marketing Info */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            Marketing Details (Flash Sales)
                        </h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                                placeholder="e.g. The Royal Heritage Sale"
                            />
                            <p className="text-xs text-muted-foreground">Required for showing this offer on the Homepage Flash Sale banner.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background min-h-[80px]"
                                placeholder="Marketing copy for the banner..."
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-background"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/admin/offers" className="px-4 py-2 border rounded-md hover:bg-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isNew ? 'Create Offer' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
