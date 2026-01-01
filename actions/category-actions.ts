'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Get all categories with product counts
export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
                parent: {
                    select: {
                        id: true,
                        name_en: true,
                    },
                },
            },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'asc' }
            ],
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Reorder categories
export async function reorderCategories(items: { id: string; sortOrder: number }[]) {
    try {
        const transaction = items.map((item) =>
            prisma.category.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            })
        );

        await prisma.$transaction(transaction);
        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error reordering categories:', error);
        return { error: 'Failed to reorder categories' };
    }
}

// Get single category by ID
export async function getCategoryById(id: string) {
    try {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
                parent: true,
                children: true,
            },
        });
        return category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

// Create new category
export async function createCategory(formData: FormData) {
    const name_en = formData.get('name_en') as string;
    const name_hi = formData.get('name_hi') as string;
    const slug = formData.get('slug') as string;
    const parentId = formData.get('parentId') as string;
    const image = formData.get('image') as string;

    if (!name_en || !slug) {
        return { error: 'Name and slug are required' };
    }

    try {
        // Check if slug already exists
        const existing = await prisma.category.findUnique({
            where: { slug },
        });

        if (existing) {
            return { error: 'Slug already exists' };
        }

        await prisma.category.create({
            data: {
                name_en,
                name_hi: name_hi || null,
                slug,
                image: image || null,
                parentId: parentId || null,
            },
        });

        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error creating category:', error);
        return { error: 'Failed to create category' };
    }
}

// Update category
export async function updateCategory(id: string, formData: FormData) {
    const name_en = formData.get('name_en') as string;
    const name_hi = formData.get('name_hi') as string;
    const slug = formData.get('slug') as string;
    const parentId = formData.get('parentId') as string;
    const image = formData.get('image') as string;

    if (!name_en || !slug) {
        return { error: 'Name and slug are required' };
    }

    try {
        // Check if slug exists for another category
        const existing = await prisma.category.findFirst({
            where: {
                slug,
                NOT: { id },
            },
        });

        if (existing) {
            return { error: 'Slug already exists' };
        }

        // Prevent circular reference
        if (parentId) {
            const isCircular = await checkCircularReference(id, parentId);
            if (isCircular) {
                return { error: 'Cannot set parent - would create circular reference' };
            }
        }

        await prisma.category.update({
            where: { id },
            data: {
                name_en,
                name_hi: name_hi || null,
                slug,
                image: image || null,
                parentId: parentId || null,
                // Note: sortOrder is primarily updated via reorder drag-and-drop
            },
        });

        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { error: 'Failed to update category' };
    }
}

// Delete category
export async function deleteCategory(id: string) {
    try {
        // Check if category has products
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
        });

        if (!category) {
            return { error: 'Category not found' };
        }

        if (category._count.products > 0) {
            return { error: `Cannot delete category with ${category._count.products} products` };
        }

        if (category._count.children > 0) {
            return { error: `Cannot delete category with ${category._count.children} sub-categories` };
        }

        await prisma.category.delete({
            where: { id },
        });

        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { error: 'Failed to delete category' };
    }
}

// Helper: Check for circular reference
async function checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
    let currentId = parentId;
    const visited = new Set<string>();

    while (currentId) {
        if (currentId === categoryId) {
            return true; // Circular reference detected
        }

        if (visited.has(currentId)) {
            return false; // Already checked this path
        }

        visited.add(currentId);

        const parent = await prisma.category.findUnique({
            where: { id: currentId },
            select: { parentId: true },
        });

        if (!parent || !parent.parentId) {
            break;
        }

        currentId = parent.parentId;
    }

    return false;
}
