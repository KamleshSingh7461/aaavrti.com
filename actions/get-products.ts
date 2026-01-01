
'use server';

import { prisma } from '@/lib/db';
import { Product } from '@/lib/types';
import { Prisma } from '@prisma/client';

const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        slug: 'banarasi-silk-saree-red',
        name_en: 'Royal Banarasi Silk Saree',
        name_hi: 'शाही बनारसी सिल्क साड़ी',
        description_en: 'Handwoven in Varanasi, this crimson red Banarasi saree features intricate zardosi work and a heavy pallu. Perfect for weddings.',
        description_hi: 'वाराणसी में हाथ से बुनी गई, इस गहरे लाल रंग की बनारसी साड़ी में जटिल जरदोजी का काम और भारी पल्लू है। शादियों के लिए उत्तम।',
        price: 15499,
        hsn_code: '5007',
        attributes: {
            fabric: 'Silk',
            color: 'Red',
            pattern: 'Zardosi',
            care: 'Dry Clean Only'
        },
        categoryId: '1-1', // Sarees
        images: ['https://images.unsplash.com/photo-1610189012906-47833a87c5a3'],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'p2',
        slug: 'chikankari-kurta-white',
        name_en: 'Classic White Chikankari Kurta',
        name_hi: 'क्लासिक सफेद चिकनकारी कुर्ता',
        description_en: 'Elegant Lucknowi Chikankari work on pure georgette fabric. Lightweight and breathable, ideal for summer gatherings.',
        description_hi: 'शुद्ध जॉर्जेट कपड़े पर सुंदर लखनवी चिकनकारी का काम। हल्का और हवादार, गर्मियों के समारोहों के लिए आदर्श।',
        price: 4599,
        hsn_code: '6204',
        attributes: {
            fabric: 'Georgette',
            color: 'White',
            size: ['S', 'M', 'L', 'XL'],
            care: 'Hand Wash'
        },
        categoryId: '1-2', // Kurtas
        images: ['https://images.unsplash.com/photo-1583391733958-e026b1346338'],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'p3',
        slug: 'mens-silk-kurta-beige',
        name_en: 'Men\'s Beige Silk Kurta Set',
        name_hi: 'पुरुषों का बेज सिल्क कुर्ता सेट',
        description_en: 'A sophisticated beige silk kurta paired with a matching churidar. Minimalist design for a refined look.',
        description_hi: 'एक मेल खाने वाले चूड़ीदार के साथ एक परिष्कृत बेज सिल्क कुर्ता। एक परिष्कृत लुक के लिए न्यूनतम डिजाइन।',
        price: 3299,
        hsn_code: '6203',
        attributes: {
            fabric: 'Silk Blend',
            color: 'Beige',
            size: ['M', 'L', 'XL'],
            care: 'Dry Clean'
        },
        categoryId: '2-1', // Men's Kurtas
        images: ['https://images.unsplash.com/photo-1560942485-b2a11cc13456'],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'p4',
        slug: 'kanjivaram-saree-green',
        name_en: 'Emerald Kanjivaram Saree',
        name_hi: 'पन्ना कांजीवरम साड़ी',
        description_en: 'Authentic Kanjivaram silk from Tamil Nadu in a deep emerald green with gold temple borders.',
        description_hi: 'तमिलनाडु से असली कांजीवरम रेशम, गहरे पन्ना हरे रंग में सुनहरे मंदिर के बॉर्डर के साथ।',
        price: 22999,
        hsn_code: '5007',
        attributes: {
            fabric: 'Pure Silk',
            color: 'Green',
            pattern: 'Temple Border',
            care: 'Dry Clean Only'
        },
        categoryId: '1-1', // Sarees
        images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb'],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

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
    const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true }
    });

    let ids = [categoryId];
    for (const child of children) {
        const descendantIds = await getDescendantCategoryIds(child.id);
        ids = [...ids, ...descendantIds];
    }
    return ids;
}

// Helper: Safely parse JSON string
function safeJsonParse(jsonString: string | null | undefined, fallback: any = {}) {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}

export async function getProducts(filter?: { categoryId?: string; featured?: boolean; slug?: string; categorySlug?: string }): Promise<Product[]> {
    try {
        let where: Prisma.ProductWhereInput = {};

        // Handle hierarchical category filtering
        if (filter?.categoryId) {
            const categoryIds = await getDescendantCategoryIds(filter.categoryId);
            where.categoryId = { in: categoryIds };
        }

        if (filter?.featured) where.featured = true;

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // Map Prisma Decimal/Json to our types (SQLite String version)
        const mappedProducts = products.map(p => ({
            ...p,
            price: Number(p.price),
            stock: (p as any).stock || 0,
            attributes: safeJsonParse(p.attributes),
            images: safeJsonParse(p.images),
            variants: (p as any).variants ? safeJsonParse((p as any).variants) : [],
        }));

        if (mappedProducts.length > 0) return mappedProducts;

        // If DB returns empty, Fallback to Mock Data explicitly for demo
        throw new Error("No products in DB, utilizing mock data");

    } catch (e) {
        // Fallback to Mock Data
        let filtered = MOCK_PRODUCTS;

        // Determine Category ID for Mock Data
        let mockCategoryId = filter?.categoryId;

        // If we have a categorySlug but the ID might be a UUID (not in mock), try to find the mock ID from the slug
        if (filter?.categorySlug && MOCK_SLUG_MAP[filter.categorySlug]) {
            // If the passed ID looks like a UUID (length > 10) or is missing, prefer the mapped ID
            if (!mockCategoryId || mockCategoryId.length > 10) {
                mockCategoryId = MOCK_SLUG_MAP[filter.categorySlug];
            }
        }

        if (mockCategoryId) {
            // Flexible match: Exact match OR Prefix match (e.g. '1' matches '1-1')
            filtered = filtered.filter(p =>
                p.categoryId === mockCategoryId ||
                p.categoryId.startsWith(mockCategoryId + '-')
            );
        }

        if (filter?.featured) filtered = filtered.filter(p => p.featured);
        if (filter?.slug) filtered = filtered.filter(p => p.slug === filter.slug);

        return filtered;
    }
}

export async function getProductById(id: string): Promise<Product | undefined> {
    try {
        const p = await prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });

        if (p) {
            return {
                ...p,
                price: Number(p.price),
                stock: (p as any).stock || 0,
                attributes: JSON.parse(p.attributes),
                images: JSON.parse(p.images),
                variants: (p as any).variants ? JSON.parse((p as any).variants) : [],
            };
        }

        // Basic fallback
        const mockP = MOCK_PRODUCTS.find(p => p.id === id);
        if (mockP) return { ...mockP, variants: mockP.variants || [] };
        return undefined;
    } catch (e) {
        // Basic fallback
        const mockP = MOCK_PRODUCTS.find(p => p.id === id);
        if (mockP) return { ...mockP, variants: mockP.variants || [] };
        return undefined;
    }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
        const p = await prisma.product.findUnique({
            where: { slug },
            include: { category: true }
        });

        if (p) {
            return {
                ...p,
                price: Number(p.price),
                stock: (p as any).stock || 0,
                attributes: JSON.parse(p.attributes),
                images: JSON.parse(p.images),
                variants: (p as any).variants ? JSON.parse((p as any).variants) : [],
            };
        }

        // Basic fallback
        const mockP = MOCK_PRODUCTS.find(p => p.slug === slug);
        if (mockP) return { ...mockP, variants: mockP.variants || [] };
        return undefined;
    } catch (e) {
        // Basic fallback
        const mockP = MOCK_PRODUCTS.find(p => p.slug === slug);
        if (mockP) return { ...mockP, variants: mockP.variants || [] };
        return undefined;
    }
}

export async function getCategoryIdBySlug(slug: string): Promise<string | null> {
    try {
        // 1. Try Real DB
        const category = await prisma.category.findUnique({
            where: { slug }
        });
        if (category) return category.id;
    } catch (e) {
        // DB failed, continue to mock map
    }

    // 2. Mock Map Fallback
    if (slug === '1-1' || slug === '1-2') return slug;

    return MOCK_SLUG_MAP[slug] || null;
}
