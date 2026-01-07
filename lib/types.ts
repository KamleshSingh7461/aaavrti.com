// Manual type definitions since Prisma Client generation is failing
export interface Category {
    id: string;
    slug: string;
    name_en: string;
    name_hi: string | null;
    image?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryWithChildren extends Category {
    children: CategoryWithChildren[];
    featuredProducts?: Product[];
}

export interface Product {
    id: string;
    slug: string; // Added for URL friendly routing
    name_en: string;
    name_hi: string | null;
    description_en: string;
    description_hi: string | null;
    price: number;
    compareAtPrice?: number;
    stock?: number; // Added for inventory check
    hsn_code: string | null;
    attributes: any; // Json
    categoryId: string;
    images: string[]; // Added for UI
    featured: boolean; // Added for Homepage
    createdAt: Date;
    updatedAt: Date;
    variants?: any; // Parsed JSON variants
    averageRating?: number;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    category?: Category;
}
