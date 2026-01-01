import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProducts } from '@/actions/get-products';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
    // Handle both [slug] (string) and [...slug] (array) cases to be safe, 
    // though this file is usually [slug] where param is string.
    // BUT we are copying code from [...slug], so we need to adapt if needed.
    // Actually, if this is [slug], params is { slug: string }.
    // If we paste the code from [...slug], it expects { slug: string[] }.
    // I need to be careful here.

    // Let's adapt the code to handle both or strictly match the file's expected param type.
    // Since this file is in `[slug]`, the param is `slug: string`. 
    // The code I read from `[...slug]` expects `slug: string[]`.

    // I will write a hybrid version that works for `[slug]` but renders the NEW UI.

    const { slug } = await params;

    // Normalization: invalid for [slug] to be array, but let's handle just in case or just treat as string
    const categorySlug = Array.isArray(slug) ? slug[slug.length - 1] : slug;

    // Find category
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
            parent: true,
            children: {
                select: {
                    id: true,
                    name_en: true,
                    slug: true
                }
            }
        }
    });

    if (!category) {
        notFound();
    }

    // Fetch products in this category (using Action for consistent Mock Fallback)
    const serializedProducts = await getProducts({
        categoryId: category.id,
        categorySlug: category.slug
    });

    // Fetch all categories for filter
    const allCategories = await prisma.category.findMany({
        select: {
            id: true,
            name_en: true,
            slug: true
        },
        orderBy: {
            name_en: 'asc'
        }
    });

    // Calculate price range
    const prices = serializedProducts.map(p => p.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    // Build breadcrumb
    const breadcrumbs = [];
    if (category.parent) {
        breadcrumbs.push({ name: category.parent.name_en, slug: category.parent.slug });
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

                {category.parent && (
                    <FadeIn delay={0.1}>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {category.parent.name_en} Collection
                        </p>
                    </FadeIn>
                )}
            </div>

            {/* Subcategories - Minimal Text Links */}
            {category.children.length > 0 && (
                <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center items-center py-6 border-y border-border/10 max-w-3xl mx-auto">
                    {category.children.map((child) => (
                        <Link
                            key={child.id}
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
                        categories={allCategories as any} // Cast to match expected type if needed
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        basePath={`/category/${Array.isArray(slug) ? slug.join('/') : slug}`} // Pass current path
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
