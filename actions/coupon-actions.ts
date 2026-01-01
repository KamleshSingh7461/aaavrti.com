"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateCouponData {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom: Date;
    validUntil: Date;
    description?: string;
}

interface CouponValidation {
    valid: boolean;
    discount: number;
    message: string;
    couponId?: string;
}

export async function createCoupon(data: CreateCouponData) {
    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                minOrderValue: data.minOrderValue || 0,
                maxDiscount: data.maxDiscount,
                usageLimit: data.usageLimit,
                validFrom: data.validFrom,
                validUntil: data.validUntil,
                description: data.description,
                active: true
            }
        });

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon };
    } catch (error: any) {
        console.error("Error creating coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function getCoupons() {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        return coupons;
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function getCouponById(id: string) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        discountAmount: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });

        return coupon;
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return null;
    }
}

export async function validateCoupon(code: string, orderTotal: number): Promise<CouponValidation> {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return { valid: false, discount: 0, message: "Invalid coupon code" };
        }

        if (!coupon.active) {
            return { valid: false, discount: 0, message: "This coupon is no longer active" };
        }

        const now = new Date();
        if (now < coupon.validFrom) {
            return { valid: false, discount: 0, message: "This coupon is not yet valid" };
        }

        if (now > coupon.validUntil) {
            return { valid: false, discount: 0, message: "This coupon has expired" };
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { valid: false, discount: 0, message: "This coupon has reached its usage limit" };
        }

        const minOrderValue = Number(coupon.minOrderValue || 0);
        if (orderTotal < minOrderValue) {
            return {
                valid: false,
                discount: 0,
                message: `Minimum order value of ₹${minOrderValue} required`
            };
        }

        let discount = 0;
        if (coupon.type === "PERCENTAGE") {
            discount = (orderTotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, Number(coupon.maxDiscount));
            }
        } else if (coupon.type === "FIXED_AMOUNT") {
            discount = Number(coupon.value);
        } else if (coupon.type === "FREE_SHIPPING") {
            // Shipping discount will be handled separately
            discount = 0;
        }

        return {
            valid: true,
            discount,
            message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
            couponId: coupon.id
        };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { valid: false, discount: 0, message: "Error validating coupon" };
    }
}

export async function updateCoupon(id: string, data: Partial<CreateCouponData> & { active?: boolean }) {
    try {
        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                ...(data.code && { code: data.code.toUpperCase() }),
                ...(data.type && { type: data.type }),
                ...(data.value !== undefined && { value: data.value }),
                ...(data.minOrderValue !== undefined && { minOrderValue: data.minOrderValue }),
                ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount }),
                ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
                ...(data.validFrom && { validFrom: data.validFrom }),
                ...(data.validUntil && { validUntil: data.validUntil }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.active !== undefined && { active: data.active })
            }
        });

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon };
    } catch (error: any) {
        console.error("Error updating coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCoupon(id: string) {
    try {
        await prisma.coupon.delete({
            where: { id }
        });

        revalidatePath("/admin/marketing/coupons");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleCouponStatus(id: string) {
    try {
        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            return { success: false, error: "Coupon not found" };
        }

        const updated = await prisma.coupon.update({
            where: { id },
            data: { active: !coupon.active }
        });

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon: updated };
    } catch (error: any) {
        console.error("Error toggling coupon status:", error);
        return { success: false, error: error.message };
    }
}

export async function getCouponStats(couponId: string) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: {
                orders: {
                    where: {
                        status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
                    },
                    select: {
                        total: true,
                        discountAmount: true
                    }
                }
            }
        });

        if (!coupon) {
            return null;
        }

        const totalOrders = coupon.orders.length;
        const totalRevenue = coupon.orders.reduce((sum, order) => sum + Number(order.total), 0);
        const totalDiscount = coupon.orders.reduce((sum, order) => sum + Number(order.discountAmount), 0);

        return {
            coupon,
            stats: {
                totalOrders,
                totalRevenue,
                totalDiscount,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            }
        };
    } catch (error) {
        console.error("Error fetching coupon stats:", error);
        return null;
    }
}
