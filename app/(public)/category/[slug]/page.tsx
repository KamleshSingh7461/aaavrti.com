
import dbConnect from '@/lib/db';
import { Category } from '@/lib/models/Product';
import { notFound } from 'next/navigation';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProducts } from '@/actions/get-products';

import { serialize } from '@/lib/serialize';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    // Normalization: Mongoose handles string vs array check
    const categorySlug = Array.isArray(slug) ? slug[slug.length - 1] : slug;

    await dbConnect();

    // First fetch category
    const rawCategory = await Category.findOne({ slug: categorySlug })
        .populate('parentId')
        .lean();

    if (!rawCategory) {
        notFound();
    }

    const category = serialize(rawCategory);

    // Explicitly fetch children if not populated (reverse relation)
    const rawChildren = await Category.find({ parentId: category._id })
        .select('name_en slug')
        .lean();

    const children = serialize(rawChildren);

    // Fetch products in this category
    const serializedProducts = await getProducts({
        categoryId: category._id,
        categorySlug: category.slug
    });

    // Fetch all categories for filter
    const rawAllCategories = await Category.find()
        .select('name_en slug parentId')
        .sort({ name_en: 1 })
        .lean();

    const serializedAllCategories = serialize(rawAllCategories);

    // Calculate price range
    const prices = serializedProducts.map((p: any) => p.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    // Build breadcrumb
    const breadcrumbs = [];
    if (category.parentId) {
        breadcrumbs.push({ name: (category.parentId as any).name_en, slug: (category.parentId as any).slug });
    }
    breadcrumbs.push({ name: category.name_en, slug: category.slug });

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-[60vh]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/products" className="hover:text-foreground">Products</Link>
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.slug} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        {index === breadcrumbs.length - 1 ? (
                            <span className="text-foreground font-medium">{crumb.name}</span>
                        ) : (
                            <Link href={`/category/${crumb.slug}`} className="hover:text-foreground">
                                {crumb.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Header - Editorial Style */}
            <div className="space-y-6 text-center max-w-4xl mx-auto pt-16 pb-8">
                <FadeIn>
                    <h1 className="text-5xl md:text-7xl font-light text-foreground tracking-tight leading-none uppercase" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        {category.name_en}
                    </h1>
                </FadeIn>

                {category.parentId && (
                    <FadeIn delay={0.1}>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {(category.parentId as any).name_en} Collection
                        </p>
                    </FadeIn>
                )}
            </div>

            {/* Subcategories - Minimal Text Links */}
            {children.length > 0 && (
                <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center items-center py-6 border-y border-border/10 max-w-3xl mx-auto">
                    {children.map((child: any) => (
                        <Link
                            key={child._id.toString()}
                            href={`/category/${child.slug}`}
                            className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline decoration-1 underline-offset-4 transition-all duration-300"
                        >
                            {child.name_en}
                        </Link>
                    ))}
                </div>
            )}

            {/* Products */}
            <div className="pt-8">
                {serializedProducts.length > 0 ? (
                    <ProductBrowser
                        initialProducts={serializedProducts}
                        categories={serializedAllCategories}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        basePath={`/category/${Array.isArray(slug) ? slug.join('/') : slug}`}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No products found in this category.</p>
                        <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                            Browse all products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
