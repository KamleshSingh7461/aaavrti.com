'use server';

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { Coupon, SEOTracking } from "@/lib/models/Marketing";

interface ChannelPerformance {
    source: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
}

interface CouponPerformance {
    id: string;
    code: string;
    orders: number;
    revenue: number;
    discount: number;
    roi: number;
}

export async function getChannelPerformance() {
    try {
        await dbConnect();
        // Aggregate by source
        const stats = await Order.aggregate([
            {
                $match: {
                    status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$source", "DIRECT"] },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        return stats.map(stat => ({
            source: stat._id,
            orders: stat.orders,
            revenue: stat.revenue,
            averageOrderValue: stat.orders > 0 ? stat.revenue / stat.orders : 0
        }));
    } catch (error) {
        console.error("Error fetching channel performance:", error);
        return [];
    }
}

export async function getCouponPerformance(limit: number = 10): Promise<CouponPerformance[]> {
    try {
        await dbConnect();
        // Since Coupon stats are often calculated from Orders, we can aggregate Orders by couponId
        // Or if Coupon model has usage stats, use that.
        // Let's use Order aggregation for accuracy of revenue.

        const couponStats = await Order.aggregate([
            {
                $match: {
                    status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] },
                    couponId: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$couponId",
                    orders: { $sum: 1 },
                    revenue: { $sum: "$total" },
                    discount: { $sum: "$discountAmount" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: limit }
        ]);

        // Populate with Coupon code
        const result = await Promise.all(couponStats.map(async (stat) => {
            const coupon = await Coupon.findById(stat._id).select('code');
            return {
                id: stat._id.toString(),
                code: coupon?.code || 'DELETED',
                orders: stat.orders,
                revenue: stat.revenue,
                discount: stat.discount,
                roi: stat.discount > 0 ? (stat.revenue / stat.discount) : 0
            };
        }));

        return result;
    } catch (error) {
        console.error("Error fetching coupon performance:", error);
        return [];
    }
}

export async function getConversionBySource() {
    try {
        await dbConnect();
        // Total orders vs Completed orders by source

        const allStats = await Order.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$source", "DIRECT"] },
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["COMPLETED", "SHIPPED", "DELIVERED"]] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const conversions = allStats.map(stat => ({
            source: stat._id,
            conversionRate: stat.total > 0 ? (stat.completed / stat.total) * 100 : 0
        }));

        return conversions;

    } catch (error) {
        console.error("Error fetching conversion by source:", error);
        return [];
    }
}

export async function getSEORankings(limit: number = 20) {
    try {
        await dbConnect();
        const rankings = await SEOTracking.find()
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        return rankings.map((r: any) => ({
            ...r,
            id: r._id.toString(),
            date: r.date // Ensure date format
        }));
    } catch (error) {
        console.error("Error fetching SEO rankings:", error);
        return [];
    }
}

export async function trackSEORanking(keyword: string, position: number, url: string, additionalData?: {
    searchVolume?: number;
    clickRate?: number;
    impressions?: number;
    clicks?: number;
}) {
    try {
        await dbConnect();
        const ranking = await SEOTracking.create({
            keyword,
            position,
            url,
            searchVolume: additionalData?.searchVolume,
            clickRate: additionalData?.clickRate,
            impressions: additionalData?.impressions,
            clicks: additionalData?.clicks
        });

        return { success: true, ranking: { ...ranking.toObject(), id: ranking._id.toString() } };
    } catch (error: any) {
        console.error("Error tracking SEO ranking:", error);
        return { success: false, error: error.message };
    }
}

export async function getCampaignPerformance() {
    try {
        await dbConnect();
        const stats = await Order.aggregate([
            {
                $match: {
                    status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] },
                    campaign: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$campaign",
                    source: { $first: "$source" }, // Approximation
                    medium: { $first: "$medium" },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$total" },
                    discount: { $sum: "$discountAmount" }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        return stats.map(stat => ({
            campaign: stat._id,
            source: stat.source || 'unknown',
            medium: stat.medium || 'unknown',
            orders: stat.orders,
            revenue: stat.revenue,
            discount: stat.discount,
            averageOrderValue: stat.orders > 0 ? stat.revenue / stat.orders : 0
        }));
    } catch (error) {
        console.error("Error fetching campaign performance:", error);
        return [];
    }
}

export async function getMarketingOverview() {
    try {
        const [channels, coupons, campaigns] = await Promise.all([
            getChannelPerformance(),
            getCouponPerformance(5),
            getCampaignPerformance()
        ]);

        const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
        const totalOrders = channels.reduce((sum, ch) => sum + ch.orders, 0);
        const totalDiscount = coupons.reduce((sum, cp) => sum + cp.discount, 0);

        return {
            channels,
            coupons,
            campaigns,
            summary: {
                totalRevenue,
                totalOrders,
                totalDiscount,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            }
        };
    } catch (error) {
        console.error("Error fetching marketing overview:", error);
        return {
            channels: [],
            coupons: [],
            campaigns: [],
            summary: {
                totalRevenue: 0,
                totalOrders: 0,
                totalDiscount: 0,
                averageOrderValue: 0
            }
        };
    }
}
