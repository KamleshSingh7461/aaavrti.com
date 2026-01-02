'use server';

import dbConnect from '@/lib/db';
import { Category } from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

import { serialize } from '@/lib/serialize';

export async function getCategories() {
    try {
        await dbConnect();

        // Use aggregation to get counts
        // $lookup to get children count and product count
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'products'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'children'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'parentId',
                    foreignField: '_id',
                    as: 'parent'
                }
            },
            {
                $unwind: {
                    path: '$parent',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    '_count.products': { $size: '$products' },
                    '_count.children': { $size: '$children' }
                    // Note: products and children arrays are now heavy, project them out
                }
            },
            {
                $project: {
                    products: 0,
                    children: 0
                }
            },
            {
                $sort: { sortOrder: 1, createdAt: 1 }
            }
        ]);

        return serialize(categories);

    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function reorderCategories(items: { id: string; sortOrder: number }[]) {
    try {
        await dbConnect();
        const bulkOps = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { sortOrder: item.sortOrder }
            }
        }));

        await Category.bulkWrite(bulkOps);
        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error reordering categories:', error);
        return { error: 'Failed to reorder categories' };
    }
}

export async function getCategoryById(id: string) {
    try {
        await dbConnect();
        // Just use findById and separate counts if needed, but aggregation is consistent
        const categories = await Category.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'products'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'childrenList' // Renamed to avoid confusion with count
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'parentId',
                    foreignField: '_id',
                    as: 'parent'
                }
            },
            { $unwind: { path: '$parent', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    '_count.products': { $size: '$products' },
                    '_count.children': { $size: '$childrenList' }
                    // Keep childrenList for response if needed? Prisma code included `children: true`
                }
            },
            {
                $project: {
                    products: 0
                }
            }
        ]);

        if (!categories.length) return null;

        return serialize(categories[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

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
        await dbConnect();
        // Check if slug already exists
        const existing = await Category.findOne({ slug });

        if (existing) {
            return { error: 'Slug already exists' };
        }

        await Category.create({
            name_en,
            name_hi: name_hi || null,
            slug,
            image: image || null,
            parentId: parentId || null,
        });

        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error creating category:', error);
        return { error: 'Failed to create category' };
    }
}

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
        await dbConnect();
        // Check if slug exists for another category
        const existing = await Category.findOne({
            slug,
            _id: { $ne: id },
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

        await Category.findByIdAndUpdate(id, {
            name_en,
            name_hi: name_hi || null,
            slug,
            image: image || null,
            parentId: parentId || null,
        });

        revalidatePath('/categories');
        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    try {
        await dbConnect();
        // Check if category has products or subcategories
        // We can check counts
        const productCount = await mongoose.model('Product').countDocuments({ categoryId: id });
        const childCount = await Category.countDocuments({ parentId: id });

        if (productCount > 0) {
            return { error: `Cannot delete category with ${productCount} products` };
        }

        if (childCount > 0) {
            return { error: `Cannot delete category with ${childCount} sub-categories` };
        }

        await Category.findByIdAndDelete(id);

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
        // In Mongoose, ids are objects, need strings for set
        const currentIdStr = currentId.toString();

        if (currentIdStr === categoryId) {
            return true;
        }

        if (visited.has(currentIdStr)) {
            return false;
        }

        visited.add(currentIdStr);

        const parent = await Category.findById(currentId).select('parentId').lean();

        if (!parent || !parent.parentId) {
            break;
        }

        currentId = parent.parentId.toString();
    }

    return false;
}
