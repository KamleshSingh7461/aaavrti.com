
import dbConnect from '@/lib/db';
import { Offer } from '@/lib/models/Marketing';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Product';
import { notFound } from 'next/navigation';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';
import Link from 'next/link';
import { Tag, Clock, ChevronRight } from 'lucide-react';

export default async function OfferDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    await dbConnect();

    // Find offer
    const offer = await Offer.findOne({ code: code.toUpperCase() }).lean();

    if (!offer || !offer.isActive) {
        notFound();
    }

    // Check if offer is expired
    if (offer.endDate && new Date(offer.endDate) < new Date()) {
        notFound();
    }

    // Fetch eligible products based on offer targeting
    let products: any[] = [];
    let query: any = { status: 'ACTIVE' };

    if (offer.applicableType === 'ALL') {
        // All products
        products = await Product.find(query)
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();
    } else if (offer.applicableType === 'CATEGORY' && offer.applicableIds) {
        // Specific categories
        const ids = JSON.parse(offer.applicableIds || '[]');
        query.category = { $in: ids };
        products = await Product.find(query)
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();
    } else if (offer.applicableType === 'PRODUCT' && offer.applicableIds) {
        // Specific products
        const ids = JSON.parse(offer.applicableIds || '[]');
        query._id = { $in: ids };
        products = await Product.find(query)
            .populate('category')
            .lean();
    } else if (offer.applicableType === 'PRICE_RANGE') {
        // Price range filtering
        if (offer.minPrice !== undefined && offer.minPrice !== null) {
            query.price = { ...query.price, $gte: offer.minPrice };
        }
        if (offer.maxPrice !== undefined && offer.maxPrice !== null) {
            query.price = { ...query.price, $lte: offer.maxPrice };
        }
        products = await Product.find(query)
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();
    } else if (offer.applicableType === 'COMBINED' && offer.applicableIds) {
        // Category + Price range
        const ids = JSON.parse(offer.applicableIds || '[]');
        query.category = { $in: ids };
        if (offer.minPrice !== undefined && offer.minPrice !== null) {
            query.price = { ...query.price, $gte: offer.minPrice };
        }
        if (offer.maxPrice !== undefined && offer.maxPrice !== null) {
            query.price = { ...query.price, $lte: offer.maxPrice };
        }
        products = await Product.find(query)
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();
    }

    // Fetch all categories for filter
    const categories = await Category.find()
        .select('name_en slug')
        .sort({ name_en: 1 })
        .lean();

    const serializedProducts = products.map((product: any) => ({
        ...product,
        id: product._id.toString(),
        price: Number(product.price),
        images: JSON.parse(product.images || '[]'),
        attributes: JSON.parse(product.attributes || '{}'),
        variants: product.variants ? JSON.parse(product.variants) : null,
        category: product.category ? { ...product.category, id: product.category._id.toString() } : null
    }));

    const serializedCategories = categories.map((c: any) => ({
        ...c,
        id: c._id.toString()
    }));

    // Calculate price range
    const prices = serializedProducts.map((p: any) => p.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    const isExpiringSoon = offer.endDate &&
        new Date(offer.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-[60vh]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/offers" className="hover:text-foreground">Offers</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{offer.code}</span>
            </nav>

            {/* Offer Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <FadeIn>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Tag className="h-6 w-6 text-primary" />
                            <span className="font-mono text-lg font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full">
                                {offer.code}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium">
                            {offer.name || offer.code}
                        </h1>
                    </FadeIn>

                    {offer.description && (
                        <FadeIn delay={0.1}>
                            <p className="text-lg text-muted-foreground">
                                {offer.description}
                            </p>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.2}>
                        <div className="text-5xl font-bold text-primary">
                            {offer.type === 'PERCENTAGE' ? (
                                <>{Number(offer.value)}% OFF</>
                            ) : (
                                <>₹{Number(offer.value)} OFF</>
                            )}
                        </div>
                    </FadeIn>

                    {/* Validity & Limits */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        {offer.endDate && (
                            <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-muted-foreground'
                                }`}>
                                <Clock className="h-4 w-4" />
                                <span>
                                    Valid until {new Date(offer.endDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        {offer.minAmount && (
                            <span className="text-muted-foreground">
                                Min. purchase: ₹{Number(offer.minAmount).toLocaleString('en-IN')}
                            </span>
                        )}
                        {offer.usageLimit && (
                            <span className="text-muted-foreground">
                                Limited to {offer.usageLimit} uses
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="pt-8">
                <h2 className="text-2xl font-serif font-medium mb-6">
                    Eligible Products ({products.length})
                </h2>

                {products.length > 0 ? (
                    <ProductBrowser
                        initialProducts={serializedProducts}
                        categories={serializedCategories}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No products available for this offer.</p>
                        <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                            Browse all products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
