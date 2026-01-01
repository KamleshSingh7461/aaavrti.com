
import { getProductById, getProducts } from '@/actions/get-products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductReviews } from '@/components/product/ProductReviews';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.name_en} | Aaavrti`,
        description: product.description_en.substring(0, 160),
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    // Fetch related products
    const relatedProducts = await getProducts({ categoryId: product.categoryId });
    const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

    // Fetch Reviews & Eligibility
    const { getProductReviews, canReviewProduct } = await import('@/actions/review-actions');
    const reviews = await getProductReviews(id);
    const canReview = await canReviewProduct(id);

    // Fetch Applicable Offers
    const { getApplicableOffers } = await import('@/actions/offer-actions');
    const offers = await getApplicableOffers(product.id, product.categoryId);

    return (
        <div className="min-h-screen bg-background animate-in fade-in duration-700">
            <div className="container mx-auto px-4 py-12 lg:py-20">
                <ProductDetails product={product} offers={offers} />

                {/* Reviews */}
                <FadeIn delay={0.3} className="pt-24 mt-0">
                    <ProductReviews
                        productId={product.id}
                        reviews={reviews}
                        canReview={canReview}
                    />
                </FadeIn>

                {/* Recommended Only for You (History) */}
                <RecentlyViewed currentProductId={product.id} />

                {/* Related Products */}
                {filteredRelated.length > 0 && (
                    <FadeIn delay={0.4} className="space-y-12 border-t border-border/50 pt-24 mt-24">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-serif">You May Also Like</h2>
                            <a href={`/category/${product.category?.slug || 'women'}`} className="flex items-center text-lg text-primary font-medium hover:gap-2 transition-all">
                                View Collection <ArrowRight className="h-4 w-4 ml-2" />
                            </a>
                        </div>
                        <ProductGrid products={filteredRelated} />
                    </FadeIn>
                )}
            </div>
        </div>
    );
}
