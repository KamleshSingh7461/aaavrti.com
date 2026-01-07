import { getProducts } from '@/actions/get-products';
import { getCategories } from '@/actions/category-actions';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'All Products | Ournika',
    description: 'Explore our complete collection of authentic Indian heritage wear.'
};

interface PageProps {
    searchParams: Promise<{
        tag?: string;
        sort?: string;
        search?: string;
    }>;
}

export default async function AllProductsPage({ searchParams }: PageProps) {
    const { tag, sort, search } = await searchParams;
    console.log('AllProductsPage searchParams (awaited):', { tag, sort, search });

    // Fetch all products
    const products = await getProducts({ search });

    // Fetch categories for filter
    const categories = await getCategories({ publicOnly: true });

    // Calculate price range
    const prices = products.map(p => Number(p.price));
    const minPrice = products.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = products.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    // Get page title based on tag
    // Get page title based on tag
    const getTitle = () => {
        const t = tag?.toLowerCase();
        if (t === 'wedding') return 'Wedding Collection';
        if (t === 'festive') return 'Festive Wear';
        if (t === 'bestseller') return 'Bestsellers';
        if (t === 'new') return 'New Arrivals';
        if (search) return `Search Results for "${search}"`;
        if (tag) return `${tag.charAt(0).toUpperCase() + tag.slice(1)} Collection`;
        return 'All Collections';
    };

    const getSubtitle = () => {
        const t = tag?.toLowerCase();
        if (t === 'wedding') return 'Exquisite Pieces for Your Special Day';
        if (t === 'festive') return 'Celebrate in Style';
        if (t === 'bestseller') return 'Our Most Loved Pieces';
        if (t === 'new') return 'Fresh from Our Artisans';
        if (search) return `Found ${products.length} matching products`;
        if (tag) return 'Curated Just For You';
        return 'The Entire Catalog';
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-[60vh]">
            {/* Header - Editorial Style */}
            <div className="space-y-6 text-center max-w-4xl mx-auto pt-16 pb-8">
                <FadeIn>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-light text-foreground tracking-tight leading-none uppercase" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        {getTitle()}
                    </h1>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {getSubtitle()}
                    </p>
                </FadeIn>
            </div>

            <div className="pt-8">
                <ProductBrowser
                    initialProducts={products}
                    categories={categories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    basePath="/products"
                    initialTag={tag}
                    initialSort={sort}
                />
            </div>
        </div>
    );
}
