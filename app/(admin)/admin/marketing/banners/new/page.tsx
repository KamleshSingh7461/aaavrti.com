
'use client';

import { useState } from 'react';
import { createBanner } from '@/actions/marketing-actions';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function NewBannerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [mobileImages, setMobileImages] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (images.length === 0) {
            toast({ title: "PC Image required", variant: "destructive" });
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set('image', images[0]);
        if (mobileImages.length > 0) {
            formData.set('mobileImage', mobileImages[0]);
        }

        const res = await createBanner(formData);

        if (res.success) {
            toast({ title: "Banner Created" });
            router.push('/marketing/banners');
        } else {
            toast({ title: "Failed", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/marketing/banners" className="p-2 hover:bg-secondary rounded-full">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <h1 className="text-2xl font-semibold font-heading">Add New Banner</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border p-6 rounded-xl space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">PC Banner Image *</label>
                        <ImageUploader
                            images={images}
                            onChange={setImages}
                            maxImages={1}
                        />
                        <p className="text-xs text-muted-foreground">Recommended: 1920x800px (Wide)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Banner Image (Optional)</label>
                        <ImageUploader
                            images={mobileImages}
                            onChange={setMobileImages}
                            maxImages={1}
                        />
                        <p className="text-xs text-muted-foreground">Recommended: 1080x1350px (Tall)</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title *</label>
                            <input name="title" required className="w-full p-2 border rounded-md bg-background" placeholder="e.g. Summer Collection" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subtitle</label>
                            <input name="subtitle" className="w-full p-2 border rounded-md bg-background" placeholder="e.g. Up to 50% Off" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Link URL</label>
                        <input name="link" className="w-full p-2 border rounded-md bg-background" placeholder="e.g. /category/women" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Button Text</label>
                        <input name="ctaText" className="w-full p-2 border rounded-md bg-background" placeholder="e.g. Shop Now" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort Order</label>
                        <input name="sortOrder" type="number" defaultValue="0" className="w-full p-2 border rounded-md bg-background" />
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium flex justify-center items-center gap-2">
                    {loading && <Loader2 className="animate-spin w-4 h-4" />}
                    Create Banner
                </button>
            </form>
        </div>
    );
}
