
'use client';

import { useState, useEffect } from 'react';
import { getBanners, deleteBanner, toggleBannerStatus } from '@/actions/marketing-actions';
import { Plus, Trash2, Power, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        const data = await getBanners();
        setBanners(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        const res = await deleteBanner(id);
        if (res.success) {
            toast({ title: 'Banner deleted' });
            loadBanners();
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        await toggleBannerStatus(id, !current);
        loadBanners();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Homepage Banners</h1>
                    <p className="text-sm text-muted-foreground">Manage hero sliders</p>
                </div>
                <Link href="/admin/marketing/banners/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" /> Add Banner
                </Link>
            </div>

            <div className="grid gap-4">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-card border p-4 rounded-lg flex items-center gap-4">
                        <div className="relative h-24 w-48 bg-secondary/10 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">
                                <Link href={`/admin/marketing/banners/${banner.id}`} className="hover:text-primary hover:underline">
                                    {banner.title}
                                </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">{banner.subtitle || 'No subtitle'}</p>
                            {banner.link && (
                                <a href={banner.link} target="_blank" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                                    {banner.link} <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/marketing/banners/${banner.id}`}
                                className="p-2 text-muted-foreground hover:bg-secondary rounded-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            </Link>
                            <button
                                onClick={() => handleToggle(banner.id, banner.isActive)}
                                className={cn("p-2 rounded-md transition-colors", banner.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50")}
                            >
                                <Power className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(banner.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {banners.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No banners active</p>
                    </div>
                )}
            </div>
        </div>
    );
}
