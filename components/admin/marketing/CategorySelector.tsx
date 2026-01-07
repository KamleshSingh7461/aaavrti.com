'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { getCategories } from '@/actions/category-actions';

interface CategorySelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await getCategories();
            setCategories(result || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name_en?.toLowerCase().includes(search.toLowerCase()) ||
        cat.name_hi?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCategories = categories.filter(cat => selectedIds.includes(cat._id));

    const toggleCategory = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const removeCategory = (id: string) => {
        onChange(selectedIds.filter(i => i !== id));
    };

    if (loading) {
        return <div className="text-sm text-muted-foreground">Loading categories...</div>;
    }

    return (
        <div className="space-y-3">
            {/* Selected Categories */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => (
                        <Badge key={cat._id} variant="secondary" className="gap-1">
                            {cat.name_en}
                            <button
                                type="button"
                                onClick={() => removeCategory(cat._id)}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Category List */}
            <div className="border rounded-lg max-h-60 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No categories found
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredCategories.map(cat => (
                            <label
                                key={cat._id}
                                className="flex items-center gap-3 p-3 hover:bg-secondary/50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(cat._id)}
                                    onChange={() => toggleCategory(cat._id)}
                                    className="rounded border-gray-300"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{cat.name_en}</div>
                                    {cat.name_hi && (
                                        <div className="text-xs text-muted-foreground">{cat.name_hi}</div>
                                    )}
                                </div>
                                {cat.productCount !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                        {cat.productCount} products
                                    </Badge>
                                )}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
