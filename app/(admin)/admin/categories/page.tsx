'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { getCategories } from '@/actions/category-actions';
import { buildCategoryTree, type CategoryWithCount, type CategoryTree } from '@/lib/category-utils';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { CategoryTreeView } from '@/components/admin/CategoryTree';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
    const [newParentId, setNewParentId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setCategoryTree(buildCategoryTree(data));
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAddNew = () => {
        setEditingCategory(null);
        setNewParentId('');
        setShowForm(true);
    };

    const handleEdit = (category: CategoryTree) => {
        setEditingCategory(category);
        setNewParentId('');
        setShowForm(true);
    };

    const handleAddChild = (parentId: string) => {
        setEditingCategory(null);
        setNewParentId(parentId);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setNewParentId('');
    };

    const handleSuccess = () => {
        loadCategories();
    };

    // Filter categories based on search
    const filteredTree = searchQuery
        ? categoryTree.filter(cat =>
            cat.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.name_hi?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : categoryTree;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Categories</h1>
                    <p className="text-sm text-muted-foreground">Organize your product catalog</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Category Tree */}
            {loading ? (
                <div className="bg-card border border-border rounded-lg shadow-sm p-12 text-center text-muted-foreground">
                    Loading categories...
                </div>
            ) : (
                <CategoryTreeView
                    categories={filteredTree}
                    onEdit={handleEdit}
                    onAddChild={handleAddChild}
                    onRefresh={loadCategories}
                />
            )}

            {/* Form Modal */}
            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    categories={categories}
                    parentId={newParentId}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
