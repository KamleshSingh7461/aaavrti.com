"use server";

import { prisma } from "@/lib/db";

interface AnalyticsSummary {
    totalSales: number;
    totalOrders: number;
    newCustomers: number;
    salesTrend: string;
    ordersTrend: string;
    customersTrend: string;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface TopProduct {
    id: string;
    name: string;
    totalSales: number;
    totalRevenue: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Get current period data (last 30 days)
        const currentPeriodOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
            },
            select: {
                total: true,
                createdAt: true
            }
        });

        // Get previous period data (30-60 days ago)
        const previousPeriodOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
            },
            select: {
                total: true
            }
        });

        // Calculate current metrics
        const totalSales = currentPeriodOrders.reduce((sum: number, order) => sum + Number(order.total), 0);
        const totalOrders = currentPeriodOrders.length;

        // Calculate previous metrics
        const previousSales = previousPeriodOrders.reduce((sum: number, order) => sum + Number(order.total), 0);
        const previousOrders = previousPeriodOrders.length;

        // Get new customers (last 30 days)
        const newCustomers = await prisma.user.count({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                role: "CUSTOMER"
            }
        });

        const previousNewCustomers = await prisma.user.count({
            where: {
                createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                role: "CUSTOMER"
            }
        });

        // Calculate trends
        const salesTrend = previousSales > 0
            ? `${((totalSales - previousSales) / previousSales * 100).toFixed(0)}%`
            : "+100%";

        const ordersTrend = previousOrders > 0
            ? `${((totalOrders - previousOrders) / previousOrders * 100).toFixed(0)}%`
            : "+100%";

        const customersTrend = previousNewCustomers > 0
            ? `${((newCustomers - previousNewCustomers) / previousNewCustomers * 100).toFixed(0)}%`
            : "+100%";

        // Add + sign for positive trends
        const formatTrend = (trend: string) => {
            const num = parseInt(trend);
            return num > 0 ? `+${trend}` : trend;
        };

        return {
            totalSales,
            totalOrders,
            newCustomers,
            salesTrend: formatTrend(salesTrend),
            ordersTrend: formatTrend(ordersTrend),
            customersTrend: formatTrend(customersTrend)
        };
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        return {
            totalSales: 0,
            totalOrders: 0,
            newCustomers: 0,
            salesTrend: "+0%",
            ordersTrend: "+0%",
            customersTrend: "+0%"
        };
    }
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startOfYear, lte: endOfYear },
                status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
            },
            select: {
                total: true,
                createdAt: true
            }
        });

        // Initialize all months with 0
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData: MonthlyRevenue[] = monthNames.map(month => ({
            month,
            revenue: 0
        }));

        // Aggregate revenue by month
        orders.forEach((order: { createdAt: Date; total: any }) => {
            const monthIndex = order.createdAt.getMonth();
            monthlyData[monthIndex].revenue += Number(order.total);
        });

        return monthlyData;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames.map(month => ({ month, revenue: 0 }));
    }
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                price: true
            },
            orderBy: {
                _sum: {
                    price: 'desc'
                }
            },
            take: limit
        });

        // Fetch product details
        const productsWithDetails = await Promise.all(
            topProducts.map(async (item: any) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { id: true, name_en: true }
                });

                return {
                    id: item.productId,
                    name: product?.name_en || "Unknown Product",
                    totalSales: item._sum.quantity || 0,
                    totalRevenue: Number(item._sum.price) || 0
                };
            })
        );

        return productsWithDetails;
    } catch (error) {
        console.error("Error fetching top products:", error);
        return [];
    }
}
