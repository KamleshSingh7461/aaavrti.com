
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createBanner, getBanner, updateBanner } from '@/actions/marketing-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function BannerFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('');
    const [mobileImage, setMobileImage] = useState('');
    const [link, setLink] = useState('');
    const [ctaText, setCtaText] = useState('Shop Now');
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        if (!isNew) {
            loadBanner();
        }
    }, [id]);

    const loadBanner = async () => {
        const banner = await getBanner(id);
        if (!banner) {
            toast({ title: 'Banner not found', variant: 'destructive' });
            router.push('/admin/marketing/banners');
            return;
        }
        setTitle(banner.title);
        setSubtitle(banner.subtitle || '');
        setImage(banner.image);
        setMobileImage((banner as any).mobileImage || '');
        setLink(banner.link || '');
        setCtaText(banner.ctaText || 'Shop Now');
        setSortOrder(banner.sortOrder);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('image', image);
        formData.append('mobileImage', mobileImage);
        formData.append('link', link);
        formData.append('ctaText', ctaText);
        formData.append('sortOrder', sortOrder.toString());

        let result;
        if (isNew) {
            result = await createBanner(formData);
        } else {
            result = await updateBanner(id, formData);
        }

        if (result.success) {
            toast({ title: isNew ? 'Banner created' : 'Banner updated' });
            router.push('/admin/marketing/banners');
            router.refresh();
        } else {
            toast({ title: result.error || 'Failed to save banner', variant: 'destructive' });
        }
        setSaving(false);
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/marketing/banners" className="p-2 hover:bg-secondary rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold font-heading">{isNew ? 'Create New Banner' : 'Edit Banner'}</h1>
                    <p className="text-sm text-muted-foreground">Configure homepage hero slider banner</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card border p-6 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border rounded-md bg-background"
                                placeholder="e.g. Summer Collection"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subtitle (Optional)</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full p-2 border rounded-md bg-background"
                                placeholder="e.g. Up to 50% Off"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">PC Banner Image (Required)</label>
                            <ImageUploader
                                images={image ? [image] : []}
                                onChange={(urls) => setImage(urls[0] || '')}
                                maxImages={1}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-background text-xs"
                                    placeholder="PC Image URL..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mobile Banner Image (Optional)</label>
                            <ImageUploader
                                images={mobileImage ? [mobileImage] : []}
                                onChange={(urls) => setMobileImage(urls[0] || '')}
                                maxImages={1}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={mobileImage}
                                    onChange={(e) => setMobileImage(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-background text-xs"
                                    placeholder="Mobile Image URL..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Link URL</label>
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full p-2 border rounded-md bg-background"
                                placeholder="e.g. /products?category=summer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Button Text</label>
                            <input
                                type="text"
                                value={ctaText}
                                onChange={(e) => setCtaText(e.target.value)}
                                className="w-full p-2 border rounded-md bg-background"
                                placeholder="e.g. Shop Now"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort Order</label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="w-full p-2 border rounded-md bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/admin/marketing/banners" className="px-4 py-2 border rounded-md hover:bg-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isNew ? 'Create Banner' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
