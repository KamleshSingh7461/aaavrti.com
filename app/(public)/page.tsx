
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

export default async function Home() {
  const categoriesFn = getCategories();
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

  const getCollection = async (slug: string) => {
    const id = await getCategoryIdBySlug(slug);
    return id ? await getProducts({ categoryId: id }) : [];
  };

  const [sarees, kurtas, mens] = await Promise.all([
    getCollection('sarees'),
    getCollection('kurtas'),
    getCollection('men')
  ]);

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

      {/* 5. Saree Lookbook Section */}
      <LookbookSection
        title="The Silk Archive"
        subtitle="Handwoven Heritage"
        description="Every thread tells a story of tradition, woven with precision and care for the modern muse."
        image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
        link="/category/sarees"
        align="left"
      />

      {/* 6. Sarees Carousel */}
      <ProductCarouselSection
        title="Curated Sarees"
        products={sarees}
        viewAllLink="/category/sarees"
      />

      {/* 7. Kurtas Lookbook Section */}
      <LookbookSection
        title="Elegance Redefined"
        subtitle="Contemporary Cuts"
        image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767273761/ChatGPT_Image_Jan_1_2026_06_50_39_PM_dpejaz.png"
        link="/category/kurtas"
        align="right"
      />

      {/* 8. Kurtas Carousel */}
      <ProductCarouselSection
        title="Modern Kurtas"
        products={kurtas}
        viewAllLink="/category/kurtas"
      />

      {/* 9. Mens Lookbook Section */}
      <LookbookSection
        title="The Royal Groom"
        subtitle="For Him"
        image="https://res.cloudinary.com/desdbjzzt/image/upload/v1767273762/sherwani_2_ohmxum.png"
        link="/category/men"
        align="center"
      />

      {/* 10. Call to Action Banner */}
      <section className="py-32 bg-secondary/10 text-center space-y-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className={cn("text-5xl md:text-7xl italic font-light", cormorant.className)}>
            The Aaavrti Experience
          </h2>
          <p className="text-muted-foreground font-light text-xl">
            Join our newsletter for exclusive access to new drops.
          </p>
          <div className="pt-4">
            <Link
              href="/signup"
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
