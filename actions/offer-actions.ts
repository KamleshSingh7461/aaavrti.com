'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { calculatePricing } from '@/lib/pricing';
import { auth } from '@/auth';

/**
 * MIGRATION NOTE: This file now uses the Coupon model instead of Offer
 * Function names remain the same for backward compatibility with existing cart/checkout code
 */

export async function getOffers() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return [];

    // Now using Coupon model
    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Map Coupon fields to match old Offer structure for compatibility
    return coupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        minAmount: Number(coupon.minOrderValue || 0),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usageCount,
        isActive: coupon.active,
        startDate: coupon.validFrom.toISOString(),
        endDate: coupon.validUntil.toISOString(),
        title: coupon.description,
        description: coupon.description,
        applicableType: 'ALL', // Coupons apply to all products
        applicableIds: '[]',
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
    }));
}

/**
 * Get applicable offers for a specific product
 * Now uses Coupon model
 */
export async function getApplicableOffers(productId: string, categoryId: string) {
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
        where: {
            active: true,
            validFrom: { lte: now },
            validUntil: { gte: now }
        }
    });

    // Filter coupons with usage limits
    const applicableCoupons = coupons.filter(coupon => {
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return false;
        }
        return true;
    });

    // Serialize for client
    return applicableCoupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        minAmount: Number(coupon.minOrderValue || 0),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        endDate: coupon.validUntil.toISOString(),
    }));
}

export async function createOffer(data: any) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        // Create using Coupon model
        await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                minOrderValue: data.minAmount || 0,
                maxDiscount: data.maxDiscount,
                usageLimit: data.usageLimit,
                validFrom: data.startDate || new Date(),
                validUntil: data.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                description: data.title || data.description,
                active: true
            }
        });
        revalidatePath('/admin/marketing/coupons');
        revalidatePath('/admin/offers');
        return { success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { error: 'Coupon code already exists' };
        return { error: 'Failed to create offer' };
    }
}

export async function toggleOfferStatus(id: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    await prisma.coupon.update({
        where: { id },
        data: { active: isActive }
    });
    revalidatePath('/admin/marketing/coupons');
    revalidatePath('/admin/offers');
    return { success: true };
}

export async function deleteOffer(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await prisma.coupon.delete({
            where: { id }
        });
        revalidatePath('/admin/marketing/coupons');
        revalidatePath('/admin/offers');
        return { success: true };
    } catch (e: any) {
        return { error: 'Failed to delete coupon' };
    }
}

export async function getOffer(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return null;

    const coupon = await prisma.coupon.findUnique({
        where: { id }
    });

    if (!coupon) return null;

    return {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        minAmount: Number(coupon.minOrderValue || 0),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        startDate: coupon.validFrom.toISOString().split('T')[0],
        endDate: coupon.validUntil.toISOString().split('T')[0],
        title: coupon.description,
        description: coupon.description,
        applicableType: 'ALL',
        applicableIds: '[]',
    };
}

export async function updateOffer(id: string, data: any) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await prisma.coupon.update({
            where: { id },
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                minOrderValue: data.minAmount || 0,
                maxDiscount: data.maxDiscount,
                usageLimit: data.usageLimit,
                validFrom: data.startDate ? new Date(data.startDate) : undefined,
                validUntil: data.endDate ? new Date(data.endDate) : undefined,
                description: data.title || data.description
            }
        });
        revalidatePath('/admin/marketing/coupons');
        revalidatePath('/admin/offers');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        if (e.code === 'P2002') return { error: 'Coupon code already exists' };
        return { error: 'Failed to update offer' };
    }
}

/**
 * Validates a coupon and returns the pricing result including prorated discounts.
 * Now uses Coupon model with enhanced validation
 */
export async function validateCoupon(code: string, cartItems: { id: string, productId?: string, price: number, quantity: number }[]) {
    if (!code) return { error: 'No code provided' };

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) return { error: 'Invalid coupon code' };
    if (!coupon.active) return { error: 'Coupon is inactive' };

    // Check Limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { error: 'Coupon usage limit reached' };
    }

    // Check Dates
    const now = new Date();
    if (now < coupon.validFrom) return { error: 'Coupon not yet active' };
    if (now > coupon.validUntil) return { error: 'Coupon expired' };

    // Calculate discount
    const result = calculatePricing(cartItems, {
        type: coupon.type,
        value: Number(coupon.value),
        minAmount: Number(coupon.minOrderValue || 0),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined
    });

    const globalSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = globalSubtotal - result.discountTotal;

    if (result.discountTotal === 0 && result.subtotal > 0) {
        if (coupon.minOrderValue && result.subtotal < Number(coupon.minOrderValue)) {
            return { error: `Minimum order amount of ₹${coupon.minOrderValue} not met` };
        }
    }

    return {
        success: true,
        offerCode: coupon.code,
        couponId: coupon.id, // NEW: Return coupon ID for order linking
        subtotal: globalSubtotal,
        discountTotal: result.discountTotal,
        finalTotal: finalTotal,
    };
}
