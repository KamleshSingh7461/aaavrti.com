'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createCategory, updateCategory } from '@/actions/category-actions';
import { generateSlug, type CategoryWithCount } from '@/lib/category-utils';
import { ImageUploader } from './ImageUploader';

interface CategoryFormProps {
    category?: CategoryWithCount | null;
    categories: CategoryWithCount[];
    parentId?: string; // For adding child categories
    onClose: () => void;
    onSuccess: () => void;
}

export function CategoryForm({ category, categories, parentId: initialParentId, onClose, onSuccess }: CategoryFormProps) {
    const [name_en, setNameEn] = useState(category?.name_en || '');
    const [name_hi, setNameHi] = useState(category?.name_hi || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [parentId, setParentId] = useState(category?.parentId || initialParentId || '');
    const [image, setImage] = useState(category?.image || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoSlug, setAutoSlug] = useState(!category);

    const isEdit = !!category?.id; // Only edit if category has an ID

    // Auto-generate slug from English name
    useEffect(() => {
        if (autoSlug && name_en) {
            setSlug(generateSlug(name_en));
        }
    }, [name_en, autoSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('name_en', name_en);
        formData.append('name_hi', name_hi);
        formData.append('slug', slug);
        formData.append('parentId', parentId);
        formData.append('image', image);

        try {
            const result = isEdit
                ? await updateCategory(category.id, formData)
                : await createCategory(formData);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Filter out current category and its descendants from parent options
    const availableParents = categories.filter(cat => {
        if (!isEdit) return true;
        if (cat.id === category.id) return false;
        // TODO: Also filter out descendants
        return true;
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">
                        {isEdit ? 'Edit Category' : 'Add Category'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-md transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Category Image
                        </label>
                        <ImageUploader
                            images={image ? [image] : []}
                            onChange={(imgs) => setImage(imgs[0] || '')}
                            maxImages={1}
                        />
                    </div>

                    {/* English Name */}
                    <div>
                        <label htmlFor="name_en" className="block text-sm font-medium mb-1.5">
                            Name (English) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name_en"
                            value={name_en}
                            onChange={(e) => setNameEn(e.target.value)}
                            required
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., Women's Clothing"
                        />
                    </div>

                    {/* Hindi Name */}
                    <div>
                        <label htmlFor="name_hi" className="block text-sm font-medium mb-1.5">
                            Name (Hindi)
                        </label>
                        <input
                            type="text"
                            id="name_hi"
                            value={name_hi}
                            onChange={(e) => setNameHi(e.target.value)}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., महिलाओं के कपड़े"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                id="slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setAutoSlug(false);
                                }}
                                required
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                placeholder="e.g., womens-clothing"
                            />
                            <p className="text-xs text-muted-foreground">
                                URL: /category/{slug || 'your-slug'}
                            </p>
                        </div>
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label htmlFor="parentId" className="block text-sm font-medium mb-1.5">
                            Parent Category
                        </label>
                        <select
                            id="parentId"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">None (Root Category)</option>
                            {availableParents.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name_en}
                                    {cat.parent && ` (under ${cat.parent.name_en})`}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1.5">
                            Leave empty to create a top-level category
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
