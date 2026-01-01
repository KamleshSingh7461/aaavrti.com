import { getRecommendedProducts } from '@/actions/cart-actions';
import { CartPageClient } from '@/components/cart/CartPageClient';

export default async function CartPage() {
    // Fetch initial recommended products (will be updated based on cart items in client)
    const recommendedProducts = await getRecommendedProducts([], 8);

    return <CartPageClient initialRecommendedProducts={recommendedProducts} />;
}
