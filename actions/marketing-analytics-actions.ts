"use server";

import { prisma } from "@/lib/db";

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
        const orders = await prisma.order.findMany({
            where: {
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
            },
            select: {
                source: true,
                total: true,
                discountAmount: true
            }
        });

        // Group by source
        const channelMap = new Map<string, { orders: number; revenue: number }>();

        orders.forEach(order => {
            const source = order.source || "DIRECT";
            const existing = channelMap.get(source) || { orders: 0, revenue: 0 };
            channelMap.set(source, {
                orders: existing.orders + 1,
                revenue: existing.revenue + Number(order.total)
            });
        });

        // Convert to array
        const channels: ChannelPerformance[] = Array.from(channelMap.entries()).map(([source, data]) => ({
            source,
            orders: data.orders,
            revenue: data.revenue,
            averageOrderValue: data.revenue / data.orders
        }));

        // Sort by revenue descending
        channels.sort((a, b) => b.revenue - a.revenue);

        return channels;
    } catch (error) {
        console.error("Error fetching channel performance:", error);
        return [];
    }
}

export async function getCouponPerformance(limit: number = 10): Promise<CouponPerformance[]> {
    try {
        const coupons = await prisma.coupon.findMany({
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

        const performance: CouponPerformance[] = coupons.map(coupon => {
            const orders = coupon.orders.length;
            const revenue = coupon.orders.reduce((sum, order) => sum + Number(order.total), 0);
            const discount = coupon.orders.reduce((sum, order) => sum + Number(order.discountAmount), 0);
            const roi = discount > 0 ? (revenue / discount) : 0;

            return {
                id: coupon.id,
                code: coupon.code,
                orders,
                revenue,
                discount,
                roi
            };
        });

        // Sort by revenue descending
        performance.sort((a, b) => b.revenue - a.revenue);

        return performance.slice(0, limit);
    } catch (error) {
        console.error("Error fetching coupon performance:", error);
        return [];
    }
}

export async function getConversionBySource() {
    try {
        // Get all orders grouped by source
        const allOrders = await prisma.order.groupBy({
            by: ['source'],
            _count: {
                id: true
            }
        });

        // Get completed orders grouped by source
        const completedOrders = await prisma.order.groupBy({
            by: ['source'],
            where: {
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
            },
            _count: {
                id: true
            }
        });

        // Calculate conversion rates
        const conversionMap = new Map<string, number>();

        completedOrders.forEach(item => {
            const source = item.source || "DIRECT";
            const total = allOrders.find(o => o.source === item.source)?._count.id || 0;
            const completed = item._count.id;
            const conversionRate = total > 0 ? (completed / total) * 100 : 0;
            conversionMap.set(source, conversionRate);
        });

        return Array.from(conversionMap.entries()).map(([source, rate]) => ({
            source,
            conversionRate: rate
        }));
    } catch (error) {
        console.error("Error fetching conversion by source:", error);
        return [];
    }
}

export async function getSEORankings(limit: number = 20) {
    try {
        // Get latest ranking for each keyword
        const rankings = await prisma.sEOTracking.findMany({
            orderBy: {
                date: 'desc'
            },
            take: limit
        });

        return rankings;
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
        const ranking = await prisma.sEOTracking.create({
            data: {
                keyword,
                position,
                url,
                searchVolume: additionalData?.searchVolume,
                clickRate: additionalData?.clickRate,
                impressions: additionalData?.impressions,
                clicks: additionalData?.clicks
            }
        });

        return { success: true, ranking };
    } catch (error: any) {
        console.error("Error tracking SEO ranking:", error);
        return { success: false, error: error.message };
    }
}

export async function getCampaignPerformance() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] },
                campaign: { not: null }
            },
            select: {
                campaign: true,
                source: true,
                medium: true,
                total: true,
                discountAmount: true
            }
        });

        // Group by campaign
        const campaignMap = new Map<string, {
            source: string;
            medium: string;
            orders: number;
            revenue: number;
            discount: number;
        }>();

        orders.forEach(order => {
            const campaign = order.campaign!;
            const existing = campaignMap.get(campaign) || {
                source: order.source || "unknown",
                medium: order.medium || "unknown",
                orders: 0,
                revenue: 0,
                discount: 0
            };

            campaignMap.set(campaign, {
                ...existing,
                orders: existing.orders + 1,
                revenue: existing.revenue + Number(order.total),
                discount: existing.discount + Number(order.discountAmount)
            });
        });

        // Convert to array
        const campaigns = Array.from(campaignMap.entries()).map(([campaign, data]) => ({
            campaign,
            ...data,
            averageOrderValue: data.revenue / data.orders
        }));

        // Sort by revenue descending
        campaigns.sort((a, b) => b.revenue - a.revenue);

        return campaigns;
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
