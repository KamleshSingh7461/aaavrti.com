"use server";

import dbConnect from "@/lib/db";
import { Coupon } from "@/lib/models/Marketing";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/serialize";

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
        await dbConnect();
        const coupon = await Coupon.create({
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
        });

        // Convert key fields to strings if needed for response
        const couponObj = coupon.toObject();
        couponObj.id = couponObj._id.toString();

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon: couponObj };
    } catch (error: any) {
        console.error("Error creating coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function getCoupons() {
    try {
        await dbConnect();
        // counts for orders? we'd need to lookup or increment a count field. 
        // UsageCount is stored on coupon, assume it tracks total uses.
        const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

        return coupons.map((c: any) => ({
            ...c,
            id: c._id.toString(),
            _count: { orders: c.usageCount || 0 }
        }));
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function getCouponById(id: string) {
    try {
        await dbConnect();
        const coupon = await Coupon.findById(id).lean();

        if (!coupon) return null;

        // Orders specific to coupon? 
        // Order model has couponId. We can fetch recent orders.
        // Doing a separate query.
        const mongoose = (await import('mongoose')).default;
        // Dynamically import Order to avoid circular dependency issues if any, though separate files usually fine.
        const { Order } = await import('@/lib/models/Order');

        const orders = await Order.find({ couponId: id })
            .select('orderNumber total discountAmount createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Convert _id to id
        const couponData: any = { ...coupon, id: coupon._id.toString() };
        couponData.orders = orders.map((o: any) => ({
            id: o._id.toString(),
            orderNumber: o.orderNumber,
            total: Number(o.total),
            discountAmount: Number(o.discountAmount),
            createdAt: o.createdAt
        }));

        return serialize(couponData);
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return null;
    }
}

export async function validateCoupon(code: string, orderTotal: number): Promise<CouponValidation> {
    try {
        await dbConnect();
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

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
            couponId: coupon._id.toString()
        };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { valid: false, discount: 0, message: "Error validating coupon" };
    }
}

export async function updateCoupon(id: string, data: Partial<CreateCouponData> & { active?: boolean }) {
    try {
        await dbConnect();

        const updateData: any = {};
        if (data.code) updateData.code = data.code.toUpperCase();
        if (data.type) updateData.type = data.type;
        if (data.value !== undefined) updateData.value = data.value;
        if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue;
        if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
        if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
        if (data.validFrom) updateData.validFrom = data.validFrom;
        if (data.validUntil) updateData.validUntil = data.validUntil;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.active !== undefined) updateData.active = data.active;

        const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });

        if (!coupon) throw new Error("Coupon not found");

        const couponObj = coupon.toObject();
        couponObj.id = couponObj._id.toString();

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon: couponObj };
    } catch (error: any) {
        console.error("Error updating coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCoupon(id: string) {
    try {
        await dbConnect();
        await Coupon.findByIdAndDelete(id);

        revalidatePath("/admin/marketing/coupons");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting coupon:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleCouponStatus(id: string) {
    try {
        await dbConnect();
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return { success: false, error: "Coupon not found" };
        }

        coupon.active = !coupon.active;
        await coupon.save();

        revalidatePath("/admin/marketing/coupons");
        return { success: true, coupon: { ...coupon.toObject(), id: coupon._id.toString() } };
    } catch (error: any) {
        console.error("Error toggling coupon status:", error);
        return { success: false, error: error.message };
    }
}

export async function getCouponStats(couponId: string) {
    try {
        await dbConnect();
        const coupon = await Coupon.findById(couponId).lean();

        if (!coupon) {
            return null;
        }

        const { Order } = await import('@/lib/models/Order');

        // Aggregation to get stats
        // Mongoose aggregation to sum totals
        const stats = await Order.aggregate([
            { $match: { couponId: couponId, status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED", "CONFIRMED"] } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$total" },
                    totalDiscount: { $sum: "$discountAmount" }
                }
            }
        ]);

        const stat = stats[0] || { totalOrders: 0, totalRevenue: 0, totalDiscount: 0 };

        return {
            coupon: { ...coupon, id: coupon._id.toString() },
            stats: {
                totalOrders: stat.totalOrders,
                totalRevenue: stat.totalRevenue,
                totalDiscount: stat.totalDiscount,
                averageOrderValue: stat.totalOrders > 0 ? stat.totalRevenue / stat.totalOrders : 0
            }
        };
    } catch (error) {
        console.error("Error fetching coupon stats:", error);
        return null;
    }
}
