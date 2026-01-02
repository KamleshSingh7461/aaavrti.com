
'use server';

import dbConnect from '@/lib/db';
import { Product, Category } from '@/lib/models/Product';
import { Product as ProductType } from '@/lib/types';
import { serialize } from '@/lib/serialize';

const MOCK_PRODUCTS: ProductType[] = [];

// Helper to find category ID by slug (Dual Mode: DB -> Mock Map)
const MOCK_SLUG_MAP: Record<string, string> = {
    'women': '1',
    'sarees': '1-1',
    'kurtas': '1-2',
    'men': '2',
    'kurtas-men': '2-1',
    'kids': '3',
    'accessories': '4',
};

// Helper: Recursively get all descendant category IDs
async function getDescendantCategoryIds(categoryId: string): Promise<string[]> {
    await dbConnect();
    const children = await Category.find({ parentId: categoryId }).select('_id');

    let ids = [categoryId];
    for (const child of children) {
        const descendantIds = await getDescendantCategoryIds(child._id.toString());
        ids = [...ids, ...descendantIds];
    }
    return ids;
}

export async function getProducts(filter?: { categoryId?: string; featured?: boolean; slug?: string; categorySlug?: string; ids?: string[] }): Promise<ProductType[]> {
    try {
        await dbConnect();
        let query: any = {};

        if (filter?.categoryId) {
            try {
                const categoryIds = await getDescendantCategoryIds(filter.categoryId);
                query.categoryId = { $in: categoryIds };
            } catch (e) { }
        }

        if (filter?.ids && filter.ids.length > 0) {
            query._id = { $in: filter.ids };
        }

        if (filter?.featured) query.featured = true;
        if (filter?.slug) query.slug = filter.slug;

        const products = await Product.find(query).sort({ createdAt: -1 }).lean();
        return serialize(products);
    } catch (e) {
        console.error("Error fetching products:", e);
        return [];
    }
}

export async function getProductById(id: string): Promise<ProductType | undefined> {
    try {
        await dbConnect();
        const p = await Product.findById(id).populate('categoryId').lean();
        return p ? serialize(p) : undefined;
    } catch (e) {
        return undefined;
    }
}

export async function getProductBySlug(slug: string): Promise<ProductType | undefined> {
    try {
        await dbConnect();
        const p = await Product.findOne({ slug }).populate('categoryId').lean();
        return p ? serialize(p) : undefined;
    } catch (e) {
        return undefined;
    }
}

export async function getCategoryIdBySlug(slug: string): Promise<string | null> {
    try {
        await dbConnect();
        const category = await Category.findOne({ slug });
        if (category) return category._id.toString();
    } catch (e) { }

    return null;
}
