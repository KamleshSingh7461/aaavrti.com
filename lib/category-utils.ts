// Utility functions for category management

import { Category } from '@/lib/types';

export interface CategoryWithCount extends Category {
    _count: {
        products: number;
        children: number;
    };
    parent?: {
        id: string;
        name_en: string;
    } | null;
    children?: CategoryWithCount[];
}

export interface CategoryTree extends CategoryWithCount {
    children: CategoryTree[];
    level: number;
}

// Build hierarchical tree from flat category list
export function buildCategoryTree(categories: CategoryWithCount[]): CategoryTree[] {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // First pass: create map of all categories
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [], level: 0 });
    });

    // Second pass: build tree structure
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id)!;

        if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
                category.level = parent.level + 1;
                parent.children.push(category);
            } else {
                // Parent not found, treat as root
                rootCategories.push(category);
            }
        } else {
            rootCategories.push(category);
        }
    });

    // Sort children recursively
    const sortChildren = (cats: CategoryTree[]) => {
        cats.sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            // Fallback to name if order is same
            return a.name_en.localeCompare(b.name_en);
        });

        cats.forEach(cat => {
            if (cat.children.length > 0) {
                sortChildren(cat.children);
            }
        });
    };

    sortChildren(rootCategories);
    return rootCategories;
}

// Generate URL-friendly slug from name
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Flatten tree back to list (for search/filter)
export function flattenCategoryTree(tree: CategoryTree[]): CategoryTree[] {
    const result: CategoryTree[] = [];

    const flatten = (categories: CategoryTree[]) => {
        categories.forEach(cat => {
            result.push(cat);
            if (cat.children.length > 0) {
                flatten(cat.children);
            }
        });
    };

    flatten(tree);
    return result;
}

// Get all parent IDs for a category (breadcrumb trail)
export function getCategoryPath(categoryId: string, categories: CategoryWithCount[]): CategoryWithCount[] {
    const path: CategoryWithCount[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
        const category = categories.find(c => c.id === currentId);
        if (!category) break;

        path.unshift(category);
        currentId = category.parentId;
    }

    return path;
}
