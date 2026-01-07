'use server';

import dbConnect from '@/lib/db';
import { Offer } from '@/lib/models/Marketing';
import { serialize } from '@/lib/serialize';
import { revalidatePath } from 'next/cache';
import {
    calculateOfferDiscount,
    findBestOffer,
    getApplicableOffers as getApplicableOffersFromCalc,
    type CartItem,
    type Offer as OfferType,
    type OfferResult
} from '@/lib/offer-calculator';

/**
 * Get all active offers
 */
export async function getActiveOffers() {
    try {
        await dbConnect();
        const offers = await Offer.find({ isActive: true })
            .sort({ priority: -1, createdAt: -1 })
            .lean();
        return serialize(offers);
    } catch (error) {
        console.error('Error fetching active offers:', error);
        return [];
    }
}

/**
 * Get offer by code
 */
export async function getOfferByCode(code: string) {
    try {
        await dbConnect();
        const offer = await Offer.findOne({
            code: code.toUpperCase(),
            isActive: true
        }).lean();

        if (!offer) return null;

        // Check if expired
        if (offer.endDate && new Date(offer.endDate) < new Date()) {
            return null;
        }

        return serialize(offer);
    } catch (error) {
        console.error('Error fetching offer:', error);
        return null;
    }
}

/**
 * Get applicable offers for a specific product (Product Page)
 */
export async function getApplicableOffers(productId: string, categoryId: string) {
    try {
        await dbConnect();

        // fetch active offers
        const offers = await Offer.find({ isActive: true }).lean();

        // Filter in memory for now (simple logic)
        // Check applicableType: ALL, CATEGORY, PRODUCT
        const validOffers = offers.filter((offer: any) => {
            // 1. Check Dates
            if (offer.startDate && new Date(offer.startDate) > new Date()) return false;
            // endDate check handled in verify, but good to check here too
            if (offer.endDate && new Date(offer.endDate) < new Date()) return false;

            // 2. Check Applicability
            if (offer.applicableType === 'ALL') return true;

            if (offer.applicableType === 'CATEGORY') {
                // Check if categoryId matches or is in list
                // Offer.targetIds stores category IDs
                return offer.targetIds?.some((id: string) => id.toString() === categoryId.toString());
            }

            if (offer.applicableType === 'PRODUCT') {
                return offer.targetIds?.some((id: string) => id.toString() === productId.toString());
            }

            return false;
        });

        return serialize(validOffers.map((o: any) => ({
            id: o._id.toString(),
            code: o.code,
            type: o.offerType,
            value: o.offerValue,
            minAmount: o.minOrderAmount,
            maxDiscount: o.maxDiscountAmount,
            endDate: o.endDate
        })));

    } catch (error) {
        console.error('Error fetching applicable offers:', error);
        return [];
    }
}

/**
 * Get applicable offers for cart items
 */
export async function getApplicableOffersForCart(cartItems: CartItem[]) {
    try {
        const offers = await getActiveOffers();
        const applicableOffers = getApplicableOffersFromCalc(cartItems, offers as OfferType[]);
        return applicableOffers;
    } catch (error) {
        console.error('Error getting applicable offers:', error);
        return [];
    }
}

/**
 * Calculate best offer for cart
 */
export async function calculateBestOfferForCart(cartItems: CartItem[]) {
    try {
        const offers = await getActiveOffers();
        const bestOffer = findBestOffer(cartItems, offers as OfferType[]);
        return bestOffer;
    } catch (error) {
        console.error('Error calculating best offer:', error);
        return null;
    }
}

/**
 * Apply offer to cart (validate and calculate)
 */
export async function applyOfferToCart(offerCode: string, cartItems: CartItem[]): Promise<{
    success: boolean;
    error?: string;
    result?: OfferResult;
}> {
    try {
        const offer = await getOfferByCode(offerCode);

        if (!offer) {
            return { success: false, error: 'Invalid or expired offer code' };
        }

        // Check usage limit
        if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
            return { success: false, error: 'Offer usage limit reached' };
        }

        // Calculate discount
        const result = calculateOfferDiscount(cartItems, offer as OfferType);

        if (result.discount === 0) {
            return { success: false, error: result.description };
        }

        return { success: true, result };
    } catch (error) {
        console.error('Error applying offer:', error);
        return { success: false, error: 'Failed to apply offer' };
    }
}

/**
 * Increment offer usage count (call when order is placed)
 */
export async function incrementOfferUsage(offerCode: string) {
    try {
        await dbConnect();
        await Offer.findOneAndUpdate(
            { code: offerCode.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );
        return { success: true };
    } catch (error) {
        console.error('Error incrementing offer usage:', error);
        return { success: false, error: 'Failed to update offer usage' };
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get all offers (admin)
 */
export async function getAllOffers() {
    try {
        await dbConnect();
        const offers = await Offer.find()
            .sort({ priority: -1, createdAt: -1 })
            .lean();
        return { success: true, offers: serialize(offers) };
    } catch (error) {
        console.error('Error fetching offers:', error);
        return { success: false, error: 'Failed to fetch offers' };
    }
}

/**
 * Get offer by ID (admin)
 */
export async function getOfferById(id: string) {
    try {
        await dbConnect();
        const offer = await Offer.findById(id).lean();
        if (!offer) return { success: false, error: 'Offer not found' };
        return { success: true, offer: serialize(offer) };
    } catch (error) {
        console.error('Error fetching offer:', error);
        return { success: false, error: 'Failed to fetch offer' };
    }
}

/**
 * Create new offer (admin)
 */
export async function createOffer(offerData: any) {
    try {
        await dbConnect();

        // Ensure code is uppercase
        offerData.code = offerData.code.toUpperCase();

        // Check if code already exists
        const existing = await Offer.findOne({ code: offerData.code });
        if (existing) {
            return { success: false, error: 'Offer code already exists' };
        }

        const offer = await Offer.create(offerData);
        revalidatePath('/admin/marketing/offers');
        revalidatePath('/offers');

        return { success: true, offer: serialize(offer) };
    } catch (error: any) {
        console.error('Error creating offer:', error);
        return { success: false, error: error.message || 'Failed to create offer' };
    }
}

/**
 * Update offer (admin)
 */
export async function updateOffer(id: string, offerData: any) {
    try {
        await dbConnect();

        // Ensure code is uppercase
        if (offerData.code) {
            offerData.code = offerData.code.toUpperCase();
        }

        const offer = await Offer.findByIdAndUpdate(
            id,
            offerData,
            { new: true, runValidators: true }
        );

        if (!offer) {
            return { success: false, error: 'Offer not found' };
        }

        revalidatePath('/admin/marketing/offers');
        revalidatePath('/offers');

        return { success: true, offer: serialize(offer) };
    } catch (error: any) {
        console.error('Error updating offer:', error);
        return { success: false, error: error.message || 'Failed to update offer' };
    }
}

/**
 * Delete offer (admin)
 */
export async function deleteOffer(id: string) {
    try {
        await dbConnect();
        const offer = await Offer.findByIdAndDelete(id);

        if (!offer) {
            return { success: false, error: 'Offer not found' };
        }

        revalidatePath('/admin/marketing/offers');
        revalidatePath('/offers');

        return { success: true };
    } catch (error) {
        console.error('Error deleting offer:', error);
        return { success: false, error: 'Failed to delete offer' };
    }
}

/**
 * Toggle offer active status (admin)
 */
export async function toggleOfferStatus(id: string) {
    try {
        await dbConnect();
        const offer = await Offer.findById(id);

        if (!offer) {
            return { success: false, error: 'Offer not found' };
        }

        offer.isActive = !offer.isActive;
        await offer.save();

        revalidatePath('/admin/marketing/offers');
        revalidatePath('/offers');

        return { success: true, isActive: offer.isActive };
    } catch (error) {
        console.error('Error toggling offer status:', error);
        return { success: false, error: 'Failed to toggle offer status' };
    }
}

/**
 * Validate coupon code (legacy function for backward compatibility)
 * This is an alias for applyOfferToCart
 */
export async function validateCoupon(code: string, cartItems: any[]) {
    return await applyOfferToCart(code, cartItems);
}
