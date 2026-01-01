import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FadeIn } from '@/components/ui/motion';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { getCategories } from '@/actions/category-actions';

export default async function BannerLinkPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Find banner by link
    const banner = await prisma.banner.findFirst({
        where: {
            link: `/${slug}`,
            isActive: true
        }
    });

    if (!banner) {
        notFound();
    }

    // Fetch products based on banner configuration
    // For now, fetch all active products (TODO: specific filtering)
    const products = await prisma.product.findMany({
        where: {
            status: 'ACTIVE'
        },
        include: {
            category: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Fetch categories for filter
    const categories = await getCategories();

    // Transform products for client component
    const serializedProducts = products.map(product => ({
        ...product,
        price: Number(product.price),
        images: JSON.parse(product.images || '[]'),
        attributes: JSON.parse(product.attributes || '{}'),
        variants: product.variants ? JSON.parse(product.variants) : null
    }));

    // Calculate price range
    const prices = serializedProducts.map(p => p.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    return (
        <div className="min-h-screen">
            {/* Banner Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="container mx-auto px-4 pb-12">
                        <FadeIn>
                            <h1 className="text-4xl md:text-6xl font-serif text-white font-medium mb-4">
                                {banner.title}
                            </h1>
                            {banner.subtitle && (
                                <p className="text-xl text-white/90 max-w-2xl">
                                    {banner.subtitle}
                                </p>
                            )}
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* Products Section with Filters */}
            <div className="container mx-auto px-4 py-8">
                <ProductBrowser
                    initialProducts={serializedProducts}
                    categories={categories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    basePath={`/${slug}`}
                />
            </div>
        </div>
    );
}
