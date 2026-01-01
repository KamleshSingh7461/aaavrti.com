'use client';

import { useState } from 'react';
import { X, Check, Image as ImageIcon, Upload, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantImageDialogProps {
    productImages: string[];
    variantImages: string[];
    onVariantImagesChange: (images: string[]) => void;
    onPoolChange: (images: string[]) => void;
}

export function VariantImageDialog({ productImages, variantImages, onVariantImagesChange, onPoolChange }: VariantImageDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const toggleImage = (img: string) => {
        const newSelection = variantImages.includes(img)
            ? variantImages.filter(i => i !== img)
            : [...variantImages, img];
        onVariantImagesChange(newSelection);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Add to pool if not exists
            const newPool = [...productImages, ...uploadedUrls.filter(url => !productImages.includes(url))];
            onPoolChange(newPool);

            // Add to variant
            onVariantImagesChange([...variantImages, ...uploadedUrls]);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 p-1.5 border border-border rounded-md hover:bg-secondary/50 transition-colors bg-background"
            >
                {variantImages.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden">
                        {variantImages.slice(0, 3).map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt="Selected"
                                className="w-8 h-8 rounded-full border-2 border-background object-cover bg-secondary"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
                <span className="text-xs font-medium px-1">
                    {variantImages.length > 0 ? `${variantImages.length} selected` : 'Add Images'}
                </span>
            </button>

            {/* Dialog/Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in-0">
                    <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-lg">Manage Variant Images</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-secondary rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                            {/* Section 1: Upload New */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload New Images
                                </label>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors bg-secondary/5">
                                    {uploading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <span className="text-sm text-muted-foreground">Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground text-center">
                                                Images uploaded here will be added to this variant AND the product library.
                                            </p>
                                            <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                                                Choose Files
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Select from Library */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Select from Product Library
                                    </label>
                                    <span className="text-xs text-muted-foreground">
                                        {variantImages.length} selected
                                    </span>
                                </div>

                                {productImages.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic p-4 text-center bg-secondary/20 rounded-md">
                                        No images in library. Upload valid images above.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                        {productImages.map((img, idx) => {
                                            const isSelected = variantImages.includes(img);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleImage(img)}
                                                    className={cn(
                                                        "relative aspect-square rounded-md overflow-hidden border-2 transition-all group",
                                                        isSelected
                                                            ? "border-primary ring-2 ring-primary/20"
                                                            : "border-transparent border-border/50 hover:border-border"
                                                    )}
                                                >
                                                    <img src={img} alt={`Lib ${idx}`} className="w-full h-full object-cover" />

                                                    {/* Selection Indicator */}
                                                    <div className={cn(
                                                        "absolute inset-0 flex items-center justify-center transition-all bg-black/20",
                                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                    )}>
                                                        <div className={cn(
                                                            "rounded-full p-1 shadow-sm",
                                                            isSelected ? "bg-primary text-primary-foreground" : "bg-white/80 text-black"
                                                        )}>
                                                            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border bg-secondary/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
