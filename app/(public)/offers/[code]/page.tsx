import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { FadeIn } from '@/components/ui/motion';
import Link from 'next/link';
import { Tag, Clock, ChevronRight } from 'lucide-react';

export default async function OfferDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;

    // Find offer
    const offer = await prisma.offer.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!offer || !offer.isActive) {
        notFound();
    }

    // Check if offer is expired
    if (offer.validUntil && new Date(offer.validUntil) < new Date()) {
        notFound();
    }

    // Fetch eligible products
    let products = [];

    if (offer.targetType === 'ALL') {
        products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
    } else if (offer.targetType === 'CATEGORY' && offer.targetId) {
        products = await prisma.product.findMany({
            where: { categoryId: offer.targetId },
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
    } else if (offer.targetType === 'PRODUCT' && offer.targetId) {
        const product = await prisma.product.findUnique({
            where: { id: offer.targetId },
            include: { category: true }
        });
        if (product) products = [product];
    }

    // Fetch all categories for filter
    const categories = await prisma.category.findMany({
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
    const prices = products.map(p => Number(p.price));
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 50000;

    const isExpiringSoon = offer.validUntil &&
        new Date(offer.validUntil).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

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
                            {offer.name}
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
                            {offer.discountType === 'PERCENTAGE' ? (
                                <>{offer.discountValue}% OFF</>
                            ) : (
                                <>₹{offer.discountValue} OFF</>
                            )}
                        </div>
                    </FadeIn>

                    {/* Validity & Limits */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        {offer.validUntil && (
                            <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-muted-foreground'
                                }`}>
                                <Clock className="h-4 w-4" />
                                <span>
                                    Valid until {new Date(offer.validUntil).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        {offer.minPurchase && (
                            <span className="text-muted-foreground">
                                Min. purchase: ₹{offer.minPurchase.toLocaleString('en-IN')}
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
                        initialProducts={products}
                        categories={categories}
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
