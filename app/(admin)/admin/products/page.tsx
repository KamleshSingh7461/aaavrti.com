'use client';

import { Plus, Search, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, bulkUpdateProductStatus, bulkDeleteProducts, type ProductWithCategory } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { getAttributes } from '@/actions/attribute-actions';
import { ProductForm } from '@/components/admin/ProductForm';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]); // New state for attributes
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadData = async () => {
        setLoading(true);
        const [productsResult, categoriesResult, attributesResult] = await Promise.all([
            getProducts({
                search: searchTerm || undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: page,
                limit: 20 // Standard pagination limit
            }),
            getCategories(),
            getAttributes(), // Fetch attributes
        ]);
        setProducts(productsResult.products);
        setTotalPages(productsResult.pages);
        setCategories(categoriesResult);
        setAttributes(attributesResult); // Set attributes
        setLoading(false);
    };


    useEffect(() => {
        loadData();
    }, [searchTerm, categoryFilter, statusFilter, page]);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product: ProductWithCategory) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;

        const result = await deleteProduct(id);
        if (result.error) {
            alert(result.error);
        } else {
            loadData();
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        if (selectedItems.length === 0) return;

        const result = await bulkUpdateProductStatus(selectedItems, status);
        if (result.error) {
            alert(result.error);
        } else {
            setSelectedItems([]);
            loadData();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) return;
        if (!confirm(`Delete ${selectedItems.length} product(s)?`)) return;

        const result = await bulkDeleteProducts(selectedItems);
        if (result.error) {
            alert(result.error);
        } else {
            setSelectedItems([]);
            loadData();
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedItems(prev =>
            prev.length === products.length ? [] : products.map(p => p.id)
        );
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleSuccess = () => {
        loadData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Products</h1>
                    <p className="text-sm text-muted-foreground">Manage your store catalog and inventory</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-lg border border-border flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {selectedItems.length} item(s) selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkStatusUpdate('ACTIVE')}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Set Active
                        </button>
                        <button
                            onClick={() => handleBulkStatusUpdate('DRAFT')}
                            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Set Draft
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-border"
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium">Product</th>
                            <th className="p-4 text-left text-sm font-medium">Category</th>
                            <th className="p-4 text-left text-sm font-medium">Price</th>
                            <th className="p-4 text-left text-sm font-medium">Stock</th>
                            <th className="p-4 text-left text-sm font-medium">Status</th>
                            <th className="p-4 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                    No products found. Click "Add Product" to create one.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                            className="rounded border-border"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-sm">{product.name_en}</div>
                                            {product.sku && (
                                                <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{product.category.name_en}</td>
                                    <td className="p-4 text-sm font-medium">₹{product.price.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`text-sm ${product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-orange-600' : ''}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            product.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id, product.name_en)}
                                                className="p-2 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    attributes={attributes}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
