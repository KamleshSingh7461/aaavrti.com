'use server';

import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
// import { OrderItem } from '@/lib/models/Order'; // Order items are embedded usually?
// In Step 96, Order model had embedded items. So we might need aggregation on Order collection to sum items.

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
        await dbConnect();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Get current period orders
        const currentOrders = await Order.find({
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
        }).select('total');

        // Get previous period orders
        const previousOrders = await Order.find({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
            status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
        }).select('total');

        // Calculate metrics
        const totalSales = currentOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const totalOrders = currentOrders.length;

        const previousSales = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const previousOrdersCount = previousOrders.length;

        // New Customers
        const newCustomers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo },
            role: "USER"
        });

        const previousNewCustomers = await User.countDocuments({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
            role: "USER"
        });

        // Trends
        const salesTrend = previousSales > 0
            ? `${((totalSales - previousSales) / previousSales * 100).toFixed(0)}%`
            : "+100%";

        const ordersTrend = previousOrdersCount > 0
            ? `${((totalOrders - previousOrdersCount) / previousOrdersCount * 100).toFixed(0)}%`
            : "+100%";

        const customersTrend = previousNewCustomers > 0
            ? `${((newCustomers - previousNewCustomers) / previousNewCustomers * 100).toFixed(0)}%`
            : "+100%";

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
        await dbConnect();
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        // Aggregation for monthly revenue
        const monthlyData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                    status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // Initialize with 0
        const result = monthNames.map((month, index) => {
            const found = monthlyData.find(m => m._id === index + 1);
            return {
                month,
                revenue: found ? found.revenue : 0
            };
        });

        return result;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        return [];
    }
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
        await dbConnect();
        // Unwind items from orders and group by productId
        const topProducts = await Order.aggregate([
            { $match: { status: { $in: ["COMPLETED", "SHIPPED", "DELIVERED"] } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    totalSales: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } // Approx revenue from items
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit }
        ]);

        // Populate product names
        const productsWithDetails = await Promise.all(
            topProducts.map(async (item: any) => {
                // If productId is null (deleted product?), handle it
                if (!item._id) return null;

                const product = await Product.findById(item._id).select('name_en');
                return {
                    id: item._id.toString(),
                    name: product?.name_en || "Unknown Product",
                    totalSales: item.totalSales,
                    totalRevenue: item.totalRevenue
                };
            })
        );

        return productsWithDetails.filter(Boolean) as TopProduct[];
    } catch (error) {
        console.error("Error fetching top products:", error);
        return [];
    }
}
