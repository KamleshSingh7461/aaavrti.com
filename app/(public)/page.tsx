
import { Cormorant_Garamond } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { getProducts, getCategoryIdBySlug } from "@/actions/get-products";
import { getCategories } from "@/actions/category-actions";
import { getActiveBanners, getFlashSale } from "@/actions/marketing-actions";
import { HeroSlider } from "@/components/marketing/HeroSlider";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { ProductCarouselSection } from "@/components/home/ProductCarouselSection";
import { FadeIn, RevealText, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { buildCategoryTree } from "@/lib/category-utils";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { LimitedTimeOffersBanner } from "@/components/home/LimitedTimeOffersBanner";
import { FashionShowcase } from "@/components/home/FashionShowcase";
import { KidsAccessoriesGrid } from "@/components/home/KidsAccessoriesGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

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

  const [sarees, kurtas, mens, women] = await Promise.all([
    getCollection('sarees'),
    getCollection('kurtas'),
    getCollection('men'),
    getCollection('women')
  ]);

  return (
    <div className="flex flex-col bg-background min-h-screen">

      {/* Dynamic Hero Section */}
      <HeroSlider banners={banners} />


      {/* Shop By Category Slider */}
      <CategoryCarousel categories={categoryTree} />

      {/* Featured Collections Grid */}
      <FeaturedCollections />

      {/* New Arrivals / Trending Slider */}
      <ProductCarouselSection
        title="Trending Now"
        products={newArrivals}
        viewAllLink="/new/arrival"
        description="Our latest and most loved collections."
      />


      {/* Limited Time Offer Banner */}
      <LimitedTimeOffersBanner offer={flashSale} />

      {/* Sarees Collection Slider */}
      <ProductCarouselSection
        title="Royal Sarees"
        products={sarees}
        viewAllLink="/category/sarees"
      />

      {/* Kurtas Slider */}
      <ProductCarouselSection
        title="Elegant Kurtas"
        products={kurtas}
        viewAllLink="/category/kurtas"
      />

      {/* Fashion Showcase - Curated Collection */}
      <FashionShowcase
        images={[
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767273761/ChatGPT_Image_Jan_1_2026_06_48_27_PM_cl4vvo.png",
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767273761/ChatGPT_Image_Jan_1_2026_06_50_39_PM_dpejaz.png",
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767273762/lehenga_bxaxpw.png",
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767273762/sherwani_2_ohmxum.png",
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767273763/lehenga_2_xxvkz6.png",
          "https://res.cloudinary.com/desdbjzzt/image/upload/v1767263859/aaavrti/products/mtsiljloa040vdrk35qq.jpg"
        ]}
      />


      {/* Men's Slider */}
      <ProductCarouselSection
        title="For Him"
        products={mens}
        viewAllLink="/category/men"
      />

      {/* For Her Slider */}
      <ProductCarouselSection
        title="For Her"
        products={women}
        viewAllLink="/category/women"
      />

      {/* Kids & Accessories Grid */}
      <KidsAccessoriesGrid />


      {/* Call to Action Banner */}
      <section className="py-24 bg-secondary/20 text-center space-y-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className={cn("text-4xl md:text-5xl font-light", cormorant.className)}>
            Discover the Art of Indian Weaves
          </h2>
          <p className="text-muted-foreground font-light text-lg">
            Explore our full collection of handcrafted sarees, suits, and accessories.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-block px-10 py-4 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-lg hover:shadow-xl font-medium uppercase tracking-wider"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Slider - Moved to Bottom */}
      <div className="container mx-auto px-4 pb-12">
        <RecentlyViewed />
      </div>
    </div>
  );
}
