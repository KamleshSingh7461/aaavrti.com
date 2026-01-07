'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { getProducts } from '@/actions/product-actions';

interface ProductSelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function ProductSelector({ selectedIds, onChange }: ProductSelectorProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadProducts();
    }, [search, page]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const result = await getProducts({
                page,
                limit: 20,
                search: search || undefined
            });
            setProducts(result.products || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedProducts = products.filter(p => selectedIds.includes(p._id));

    const toggleProduct = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const removeProduct = (id: string) => {
        onChange(selectedIds.filter(i => i !== id));
    };

    if (loading && products.length === 0) {
        return <div className="text-sm text-muted-foreground">Loading products...</div>;
    }

    return (
        <div className="space-y-3">
            {/* Selected Products */}
            {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(product => (
                        <Badge key={product._id} variant="secondary" className="gap-1">
                            {product.name_en}
                            <button
                                type="button"
                                onClick={() => removeProduct(product._id)}
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
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="pl-9"
                />
            </div>

            {/* Product List */}
            <div className="border rounded-lg max-h-60 overflow-y-auto">
                {products.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No products found
                    </div>
                ) : (
                    <div className="divide-y">
                        {products.map(product => (
                            <label
                                key={product._id}
                                className="flex items-center gap-3 p-3 hover:bg-secondary/50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(product._id)}
                                    onChange={() => toggleProduct(product._id)}
                                    className="rounded border-gray-300"
                                />
                                {product.images?.[0] && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name_en}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{product.name_en}</div>
                                    <div className="text-xs text-muted-foreground">
                                        ₹{product.price}
                                    </div>
                                </div>
                                {product.stock !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                        Stock: {product.stock}
                                    </Badge>
                                )}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
}
