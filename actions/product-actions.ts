'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ProductWithCategory {
    id: string;
    slug: string;
    sku: string | null;
    name_en: string;
    name_hi: string | null;
    description_en: string;
    description_hi: string | null;
    price: number;
    stock: number;
    status: string;
    featured: boolean;
    images: string[];
    variants: string | null; // JSON string
    attributes: any;
    category: {
        id: string;
        name_en: string;
        slug: string;
    };
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Get all products with filters and pagination
export async function getProducts(filters?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    try {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Search filter
        if (filters?.search) {
            where.OR = [
                { name_en: { contains: filters.search } },
                { name_hi: { contains: filters.search } },
                { sku: { contains: filters.search } },
            ];
        }

        // Category filter
        if (filters?.category && filters.category !== 'all') {
            where.categoryId = filters.category;
        }

        // Status filter
        if (filters?.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name_en: true,
                            slug: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        // Parse JSON fields
        const parsedProducts = products.map(product => ({
            ...product,
            price: Number(product.price),
            images: JSON.parse(product.images || '[]'),
            attributes: JSON.parse(product.attributes || '{}'),
        }));

        return {
            products: parsedProducts as ProductWithCategory[],
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            products: [],
            total: 0,
            pages: 0,
            currentPage: 1,
        };
    }
}

// Get single product by ID
export async function getProductById(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name_en: true,
                        slug: true,
                    },
                },
            },
        });

        if (!product) {
            return null;
        }

        return {
            ...product,
            price: Number(product.price),
            images: JSON.parse(product.images || '[]'),
            attributes: JSON.parse(product.attributes || '{}'),
        } as ProductWithCategory;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Create new product
export async function createProduct(formData: FormData) {
    try {
        const name_en = formData.get('name_en') as string;
        const name_hi = formData.get('name_hi') as string | null;
        const description_en = formData.get('description_en') as string;
        const description_hi = formData.get('description_hi') as string | null;
        const categoryId = formData.get('categoryId') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string) || 0;
        const sku = formData.get('sku') as string | null;
        const status = formData.get('status') as string || 'DRAFT';
        const featured = formData.get('featured') === 'true';

        // SEO fields
        const meta_title = formData.get('meta_title') as string | null;
        const meta_description = formData.get('meta_description') as string | null;
        const meta_keywords = formData.get('meta_keywords') as string | null;

        // JSON fields
        const images = formData.get('images') as string || '[]';
        const attributes = formData.get('attributes') as string || '{}';
        const variants = formData.get('variants') as string || '[]';

        // Generate slug from name
        const slug = name_en
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        const existing = await prisma.product.findUnique({
            where: { slug },
        });

        if (existing) {
            return { error: 'A product with this name already exists' };
        }

        const product = await prisma.product.create({
            data: {
                slug,
                sku,
                name_en,
                name_hi,
                description_en,
                description_hi,
                price,
                stock,
                status,
                featured,
                images,
                attributes,
                variants,
                meta_title,
                meta_description,
                meta_keywords,
                categoryId,
            },
        });

        revalidatePath('/products');
        return { success: true, product };
    } catch (error: any) {
        console.error('Error creating product:', error);
        if (error.code === 'P2002') {
            return { error: 'SKU already exists' };
        }
        return { error: 'Failed to create product' };
    }
}

// Update existing product
export async function updateProduct(id: string, formData: FormData) {
    try {
        const name_en = formData.get('name_en') as string;
        const name_hi = formData.get('name_hi') as string | null;
        const description_en = formData.get('description_en') as string;
        const description_hi = formData.get('description_hi') as string | null;
        const categoryId = formData.get('categoryId') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string) || 0;
        const sku = formData.get('sku') as string | null;
        const status = formData.get('status') as string || 'DRAFT';
        const featured = formData.get('featured') === 'true';

        // JSON fields
        const images = formData.get('images') as string;
        const variants = formData.get('variants') as string;

        // SEO
        const meta_title = formData.get('meta_title') as string;
        const meta_description = formData.get('meta_description') as string;
        const meta_keywords = formData.get('meta_keywords') as string;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name_en,
                name_hi: name_hi || null,
                description_en,
                description_hi: description_hi || null,
                price: price,
                stock: stock,
                sku: sku || null,
                status,
                featured,
                categoryId,
                images: images || undefined,
                variants: variants || undefined,
                attributes: formData.get('attributes') as string || undefined,
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                meta_keywords: meta_keywords || null,
            },
        });

        // Debug log
        console.log('Product updated:', id);
        console.log('Attributes updated to:', formData.get('attributes'));

        try {
            revalidatePath('/products');
            revalidatePath(`/products/${id}`);
        } catch (e) {
            console.error('Revalidate path failed (expected in script):', e);
        }

        return { success: true, product };
    } catch (error: any) {
        console.error('Error updating product:', error);
        if (error.code === 'P2002') {
            return { error: 'SKU already exists' };
        }
        return { error: `Failed to update product: ${error.message}` };
    }
}

// Delete product
export async function deleteProduct(id: string) {
    try {
        // Check if product has orders
        const orderCount = await prisma.orderItem.count({
            where: { productId: id },
        });

        if (orderCount > 0) {
            return { error: `Cannot delete product with ${orderCount} order(s)` };
        }

        await prisma.product.delete({
            where: { id },
        });

        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { error: 'Failed to delete product' };
    }
}

// Bulk update product status
export async function bulkUpdateProductStatus(ids: string[], status: string) {
    try {
        await prisma.product.updateMany({
            where: {
                id: {
                    in: ids,
                },
            },
            data: {
                status,
            },
        });

        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error bulk updating products:', error);
        return { error: 'Failed to update products' };
    }
}

// Bulk delete products
export async function bulkDeleteProducts(ids: string[]) {
    try {
        // Check if any products have orders
        const orderCount = await prisma.orderItem.count({
            where: {
                productId: {
                    in: ids,
                },
            },
        });

        if (orderCount > 0) {
            return { error: `Cannot delete products with existing orders` };
        }

        await prisma.product.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error bulk deleting products:', error);
        return { error: 'Failed to delete products' };
    }
}
