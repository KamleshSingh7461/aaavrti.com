import { getProducts } from '@/actions/get-products';
import dbConnect from '@/lib/db';
import { Category } from '@/lib/models/Product';
import { serialize } from '@/lib/serialize';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Arrivals | Aaavrti',
    description: 'Discover the latest additions to our authentic Indian heritage collection.'
};

export default async function NewArrivalsPage() {
    // getProducts returns newest first by default
    const products = await getProducts({});

    await dbConnect();

    // Fetch filters
    const categories = await Category.find({ parent: null })
        .select('name_en slug')
        .sort({ sortOrder: 1 })
        .lean();

    const serializedCategories = serialize(categories);

    const prices = products.map((p: any) => Number(p.price));
    const minPrice = Math.floor(Math.min(...prices, 0) / 100) * 100;
    const maxPrice = Math.ceil(Math.max(...prices, 50000) / 100) * 100;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-[60vh]">
            {/* Header - Editorial Style */}
            <div className="space-y-6 text-center max-w-4xl mx-auto pt-16 pb-8">
                <FadeIn>
                    <h1 className="text-5xl md:text-7xl font-light text-foreground tracking-tight leading-none uppercase" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        New Arrivals
                    </h1>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Fresh from the Loom
                    </p>
                </FadeIn>
            </div>

            <div className="pt-8">
                <ProductBrowser
                    initialProducts={products}
                    categories={serializedCategories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    initialSort="newest"
                />
            </div>
        </div>
    );
}
