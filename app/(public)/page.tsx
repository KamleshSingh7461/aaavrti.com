
import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { getProducts, getCategoryIdBySlug } from "@/actions/get-products";
import { getCategories } from "@/actions/category-actions";
import { getActiveBanners, getFlashSale } from "@/actions/marketing-actions";
import { buildCategoryTree } from "@/lib/category-utils";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

// Original Components (Restored)
import { HeroSlider } from "@/components/marketing/HeroSlider";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { ProductCarouselSection } from "@/components/home/ProductCarouselSection";
import { LookbookSection } from "@/components/home/LookbookSection";
import { LimitedTimeOffersBanner } from "@/components/home/LimitedTimeOffersBanner";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

import { getMetadataForPath } from "@/actions/seo-actions";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getMetadataForPath('/');
  if (seo) {
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords?.split(','),
      openGraph: {
        images: seo.ogImage ? [seo.ogImage] : undefined
      }
    };
  }
  return {}; // Fallback to layout metadata
}

// Helper to get category data with products
async function getCategoryData(slug: string) {
  const id = await getCategoryIdBySlug(slug);
  if (!id) return null;

  const products = await getProducts({ categoryId: id });
  return {
    slug,
    products,
    link: `/category/${slug}`
  };
}

export default async function Home() {
  const categoriesFn = getCategories({ publicOnly: true });
  const bannersFn = getActiveBanners();
  const newArrivalsFn = getProducts({ featured: true });
  const flashSaleFn = getFlashSale();

  const [categoriesFlat, banners, newArrivals, flashSale] = await Promise.all([
    categoriesFn,
    bannersFn,
    newArrivalsFn,
    flashSaleFn
  ]);

  const categoryTree = buildCategoryTree(categoriesFlat as any);

  // Dynamically fetch featured categories
  // Priority order: sarees, kurtas, women, men
  const featuredSlugs = ['sarees', 'kurtas', 'women', 'men'];
  const categoryDataPromises = featuredSlugs.map(slug => getCategoryData(slug));
  const categoryDataResults = await Promise.all(categoryDataPromises);

  // Filter out null results and create a map
  const categoryData = categoryDataResults.filter(Boolean) as Array<{
    slug: string;
    products: any[];
    link: string;
  }>;

  // Get specific categories for easier access
  const sarees = categoryData.find(c => c.slug === 'sarees');
  const kurtas = categoryData.find(c => c.slug === 'kurtas');
  const women = categoryData.find(c => c.slug === 'women');
  const men = categoryData.find(c => c.slug === 'men');

  return (
    <div className="flex flex-col bg-background min-h-screen">

      {/* 1. Original Hero Slider (Premium with Gold Accents) */}
      <HeroSlider banners={banners} />

      {/* 2. Original Category Carousel (Vertical Cards) */}
      <CategoryCarousel categories={categoryTree} />

      {/* 3. Limited Time Flash Sale */}
      <LimitedTimeOffersBanner offer={flashSale as any} />

      {/* 4. New Arrivals Carousel */}
      <ProductCarouselSection
        title="New Arrivals"
        products={newArrivals}
        viewAllLink="/new/arrival"
        description="Discover our latest handcrafted pieces"
      />

      {/* 5. Saree Lookbook Section - Only show if sarees category exists */}
      {sarees && sarees.products.length > 0 && (
        <>
          <LookbookSection
            title="The Silk Archive"
            subtitle="Handwoven Heritage"
            description="Every thread tells a story of tradition, woven with precision and care for the modern muse."
            image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
            link={sarees.link}
            align="left"
          />

          {/* 6. Sarees Carousel */}
          <ProductCarouselSection
            title="Curated Sarees"
            products={sarees.products}
            viewAllLink={sarees.link}
          />
        </>
      )}

      {/* 7. Kurtas Lookbook Section - Only show if kurtas category exists */}
      {kurtas && kurtas.products.length > 0 && (
        <>
          <LookbookSection
            title="Elegance Redefined"
            subtitle="Contemporary Cuts"
            image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767273761/ChatGPT_Image_Jan_1_2026_06_50_39_PM_dpejaz.png"
            link={kurtas.link}
            align="right"
          />

          {/* 8. Kurtas Carousel */}
          <ProductCarouselSection
            title="Modern Kurtas"
            products={kurtas.products}
            viewAllLink={kurtas.link}
          />
        </>
      )}

      {/* 9. For Her Product Carousel - Only show if women category exists */}
      {women && women.products.length > 0 && (
        <ProductCarouselSection
          title="For Her"
          products={women.products}
          viewAllLink={women.link}
          description="Exquisite collections for the modern woman"
        />
      )}

      {/* 10. Mens Lookbook Section - Only show if men category exists */}
      {men && men.products.length > 0 && (
        <>
          <LookbookSection
            title="The Royal Groom"
            subtitle="For Him"
            image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767273762/sherwani_2_ohmxum.png"
            link={men.link}
            align="center"
          />

          {/* 11. For Him Product Carousel */}
          <ProductCarouselSection
            title="For Him"
            products={men.products}
            viewAllLink={men.link}
            description="Timeless elegance for the distinguished gentleman"
          />
        </>
      )}

      {/* 12. Call to Action Banner */}
      <section className="py-32 bg-secondary/10 text-center space-y-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className={cn("text-5xl md:text-7xl italic font-light", cormorant.className)}>
            The Ournika Experience
          </h2>
          <p className="text-muted-foreground font-light text-xl">
            Join our newsletter for exclusive access to new drops.
          </p>
          <div className="pt-4">
            <Link
              href="/auth/signup"
              className="inline-block border-b border-black pb-1 text-lg uppercase tracking-widest hover:opacity-50 transition-opacity"
            >
              Join the Club
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Slider */}
      <div className="container mx-auto px-4 pb-24 pt-12">
        <RecentlyViewed />
      </div>
    </div>
  );
}
