/**
 * Offer Calculator - Centralized logic for calculating offer discounts
 * Supports: PERCENTAGE, FIXED, BUNDLE, BOGO, MIX_MATCH, QUANTITY_DISCOUNT, TIERED
 */

export interface CartItem {
    id: string;
    slug: string;
    name_en: string;
    price: number;
    quantity: number;
    categoryId?: string;
    category?: {
        id: string;
        slug: string;
        name_en: string;
    };
}

export interface Offer {
    id: string;
    code: string;
    title?: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED' | 'BUNDLE' | 'BOGO' | 'MIX_MATCH' | 'QUANTITY_DISCOUNT' | 'TIERED';
    value: number;
    minAmount?: number;
    maxDiscount?: number;
    bundleQuantity?: number;
    bundlePrice?: number;
    buyQuantity?: number;
    getQuantity?: number;
    getDiscount?: number;
    tiers?: string; // JSON string
    applicableType: 'ALL' | 'CATEGORY' | 'PRODUCT' | 'PRICE_RANGE' | 'COMBINED';
    applicableIds?: string; // JSON string
    minPrice?: number;
    maxPrice?: number;
    badgeText?: string;
    priority?: number;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
}

export interface OfferResult {
    offer: Offer;
    discount: number;
    description: string;
    appliedItems: string[]; // Product IDs that got the discount
    savings: number;
}

/**
 * Check if a product is eligible for an offer
 */
export function isProductEligible(item: CartItem, offer: Offer): boolean {
    // Check if offer is active
    if (!offer.isActive) return false;

    // Check date validity
    if (offer.startDate && new Date(offer.startDate) > new Date()) return false;
    if (offer.endDate && new Date(offer.endDate) < new Date()) return false;

    // Check applicability
    switch (offer.applicableType) {
        case 'ALL':
            return true;

        case 'PRODUCT':
            const productIds = JSON.parse(offer.applicableIds || '[]');
            return productIds.includes(item.id);

        case 'CATEGORY':
            const categoryIds = JSON.parse(offer.applicableIds || '[]');
            return item.categoryId ? categoryIds.includes(item.categoryId) : false;

        case 'PRICE_RANGE':
            if (offer.minPrice && item.price < offer.minPrice) return false;
            if (offer.maxPrice && item.price > offer.maxPrice) return false;
            return true;

        case 'COMBINED':
            // Check both category and price range
            const combCategoryIds = JSON.parse(offer.applicableIds || '[]');
            const categoryMatch = item.categoryId ? combCategoryIds.includes(item.categoryId) : false;
            const priceMatch = (!offer.minPrice || item.price >= offer.minPrice) &&
                (!offer.maxPrice || item.price <= offer.maxPrice);
            return categoryMatch && priceMatch;

        default:
            return false;
    }
}

/**
 * Get all eligible items from cart for an offer
 */
export function getEligibleItems(cartItems: CartItem[], offer: Offer): CartItem[] {
    return cartItems.filter(item => isProductEligible(item, offer));
}

/**
 * Calculate discount for PERCENTAGE offer
 */
function calculatePercentageDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    const eligibleItems = getEligibleItems(cartItems, offer);
    const subtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = (subtotal * offer.value) / 100;

    // Apply max discount cap
    if (offer.maxDiscount && discount > offer.maxDiscount) {
        discount = offer.maxDiscount;
    }

    return {
        offer,
        discount,
        description: `${offer.value}% off on eligible items`,
        appliedItems: eligibleItems.map(i => i.id),
        savings: discount
    };
}

/**
 * Calculate discount for FIXED amount offer
 */
function calculateFixedDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    const eligibleItems = getEligibleItems(cartItems, offer);
    const subtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const discount = Math.min(offer.value, subtotal);

    return {
        offer,
        discount,
        description: `₹${offer.value} off`,
        appliedItems: eligibleItems.map(i => i.id),
        savings: discount
    };
}

/**
 * Calculate discount for BUNDLE offer (Buy X @ ₹Y)
 */
function calculateBundleDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    if (!offer.bundleQuantity || !offer.bundlePrice) {
        return { offer, discount: 0, description: 'Invalid bundle configuration', appliedItems: [], savings: 0 };
    }

    const eligibleItems = getEligibleItems(cartItems, offer);
    const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

    if (totalQuantity < offer.bundleQuantity) {
        return { offer, discount: 0, description: `Add ${offer.bundleQuantity - totalQuantity} more items`, appliedItems: [], savings: 0 };
    }

    // Calculate how many complete bundles
    const bundleCount = Math.floor(totalQuantity / offer.bundleQuantity);
    const originalCost = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const bundleCost = bundleCount * offer.bundlePrice;
    const remainingItems = totalQuantity % offer.bundleQuantity;

    // Calculate cost of remaining items at original price
    let remainingCost = 0;
    let counted = 0;
    for (const item of eligibleItems) {
        if (counted >= bundleCount * offer.bundleQuantity) {
            remainingCost += item.price * Math.min(item.quantity, remainingItems - counted);
        }
        counted += item.quantity;
    }

    const discount = originalCost - (bundleCost + remainingCost);

    return {
        offer,
        discount: Math.max(0, discount),
        description: `Buy ${offer.bundleQuantity} @ ₹${offer.bundlePrice}`,
        appliedItems: eligibleItems.map(i => i.id),
        savings: Math.max(0, discount)
    };
}

/**
 * Calculate discount for BOGO offer (Buy X Get Y)
 */
function calculateBOGODiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    if (!offer.buyQuantity || !offer.getQuantity) {
        return { offer, discount: 0, description: 'Invalid BOGO configuration', appliedItems: [], savings: 0 };
    }

    const eligibleItems = getEligibleItems(cartItems, offer);
    const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

    const setsRequired = offer.buyQuantity + offer.getQuantity;
    if (totalQuantity < setsRequired) {
        return { offer, discount: 0, description: `Add ${setsRequired - totalQuantity} more items`, appliedItems: [], savings: 0 };
    }

    // Calculate how many complete sets
    const setCount = Math.floor(totalQuantity / setsRequired);
    const freeItems = setCount * offer.getQuantity;

    // Sort items by price (ascending) to give discount on cheapest items
    const sortedItems = [...eligibleItems].sort((a, b) => a.price - b.price);

    let discount = 0;
    let freeCount = freeItems;

    for (const item of sortedItems) {
        if (freeCount <= 0) break;
        const itemsToDiscount = Math.min(item.quantity, freeCount);
        discount += item.price * itemsToDiscount * ((offer.getDiscount || 100) / 100);
        freeCount -= itemsToDiscount;
    }

    return {
        offer,
        discount,
        description: `Buy ${offer.buyQuantity} Get ${offer.getQuantity} ${offer.getDiscount === 100 ? 'Free' : offer.getDiscount + '% off'}`,
        appliedItems: eligibleItems.map(i => i.id),
        savings: discount
    };
}

/**
 * Calculate discount for MIX_MATCH offer
 */
function calculateMixMatchDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    // Mix & Match is similar to BUNDLE but allows different products
    return calculateBundleDiscount(cartItems, offer);
}

/**
 * Calculate discount for QUANTITY_DISCOUNT offer
 */
function calculateQuantityDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    // Similar to bundle but with specific price point targeting
    return calculateBundleDiscount(cartItems, offer);
}

/**
 * Calculate discount for TIERED offer
 */
function calculateTieredDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    if (!offer.tiers) {
        return { offer, discount: 0, description: 'Invalid tier configuration', appliedItems: [], savings: 0 };
    }

    const eligibleItems = getEligibleItems(cartItems, offer);
    const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Parse tiers and find applicable tier
    const tiers = JSON.parse(offer.tiers) as Array<{ quantity: number; discount: number }>;
    const sortedTiers = tiers.sort((a, b) => b.quantity - a.quantity);

    let applicableTier = null;
    for (const tier of sortedTiers) {
        if (totalQuantity >= tier.quantity) {
            applicableTier = tier;
            break;
        }
    }

    if (!applicableTier) {
        const nextTier = tiers.sort((a, b) => a.quantity - b.quantity)[0];
        return {
            offer,
            discount: 0,
            description: `Add ${nextTier.quantity - totalQuantity} more for ${nextTier.discount}% off`,
            appliedItems: [],
            savings: 0
        };
    }

    const discount = (subtotal * applicableTier.discount) / 100;

    return {
        offer,
        discount,
        description: `${applicableTier.discount}% off on ${totalQuantity} items`,
        appliedItems: eligibleItems.map(i => i.id),
        savings: discount
    };
}

/**
 * Calculate discount for any offer type
 */
export function calculateOfferDiscount(cartItems: CartItem[], offer: Offer): OfferResult {
    // Check minimum amount
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (offer.minAmount && cartTotal < offer.minAmount) {
        return {
            offer,
            discount: 0,
            description: `Add ₹${offer.minAmount - cartTotal} more to qualify`,
            appliedItems: [],
            savings: 0
        };
    }

    switch (offer.type) {
        case 'PERCENTAGE':
            return calculatePercentageDiscount(cartItems, offer);
        case 'FIXED':
            return calculateFixedDiscount(cartItems, offer);
        case 'BUNDLE':
            return calculateBundleDiscount(cartItems, offer);
        case 'BOGO':
            return calculateBOGODiscount(cartItems, offer);
        case 'MIX_MATCH':
            return calculateMixMatchDiscount(cartItems, offer);
        case 'QUANTITY_DISCOUNT':
            return calculateQuantityDiscount(cartItems, offer);
        case 'TIERED':
            return calculateTieredDiscount(cartItems, offer);
        default:
            return { offer, discount: 0, description: 'Unknown offer type', appliedItems: [], savings: 0 };
    }
}

/**
 * Find the best offer for a cart (highest savings)
 */
export function findBestOffer(cartItems: CartItem[], offers: Offer[]): OfferResult | null {
    if (!offers || offers.length === 0) return null;

    const results = offers
        .filter(offer => offer.isActive)
        .map(offer => calculateOfferDiscount(cartItems, offer))
        .filter(result => result.discount > 0)
        .sort((a, b) => b.savings - a.savings);

    return results[0] || null;
}

/**
 * Get all applicable offers for cart (sorted by savings)
 */
export function getApplicableOffers(cartItems: CartItem[], offers: Offer[]): OfferResult[] {
    return offers
        .filter(offer => offer.isActive)
        .map(offer => calculateOfferDiscount(cartItems, offer))
        .filter(result => result.discount > 0)
        .sort((a, b) => b.savings - a.savings);
}
