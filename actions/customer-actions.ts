'use server';

import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';

export interface CustomerWithStats {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    createdAt: Date;
    emailVerified: Date | null;
    _count: {
        orders: number;
    };
    totalSpent: number;
}

// Get all customers with stats
export async function getCustomers(filters?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}) {
    try {
        await dbConnect();
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const query: any = { role: 'USER' }; // Only get customers

        // Search filter
        if (filters?.search) {
            const regex = new RegExp(filters.search, 'i');
            query.$or = [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
                { phone: { $regex: regex } },
            ];
        }

        // Date range filter
        if (filters?.dateFrom || filters?.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        const total = await User.countDocuments(query);

        const aggregationPipeline: any[] = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    orderCount: { $size: '$orders' },
                    totalSpent: {
                        $reduce: {
                            input: '$orders',
                            initialValue: 0,
                            in: { $add: ['$$value', { $ifNull: ['$$this.total', 0] }] }
                        }
                    }
                }
            },
            { $project: { orders: 0, password: 0 } }
        ];

        const customers = await User.aggregate(aggregationPipeline);

        // Map to interface
        const customersWithStats = customers.map((customer: any) => ({
            id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            createdAt: customer.createdAt,
            emailVerified: customer.emailVerified,
            _count: {
                orders: customer.orderCount
            },
            totalSpent: customer.totalSpent
        }));

        return {
            customers: customersWithStats,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching customers:', error);
        return {
            customers: [],
            total: 0,
            pages: 0,
            currentPage: 1,
        };
    }
}

// Get single customer by ID with full details
export async function getCustomerById(id: string) {
    try {
        await dbConnect();
        const customer = await User.findById(id).lean();

        if (!customer) return null;

        // Fetch Orders
        const { Order } = await import('@/lib/models/Order');
        const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean();

        // Fetch Reviews (Optional, if we have Review model)
        const { Review } = await import('@/lib/models/Product');
        const reviews = await Review.find({ userId: id }).populate('productId', 'name_en').lean();

        // Calculate stats
        const totalOrders = orders.length;
        const validOrders = orders.filter((o: any) => o.status !== 'CANCELLED');
        const totalSpent = validOrders.reduce((sum: number, order: any) => sum + Number(order.total), 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const lastOrder = orders[0] || null;

        return {
            ...customer,
            id: customer._id.toString(),
            addresses: customer.addresses || [], // Embedded in User
            orders: orders.map((order: any) => ({
                ...order,
                id: order._id.toString(),
                subtotal: Number(order.subtotal),
                tax: Number(order.tax),
                shippingCost: Number(order.shippingCost),
                total: Number(order.total),
                items: order.items || []
            })),
            reviews: reviews.map((r: any) => ({
                ...r,
                id: r._id.toString(),
                product: r.productId // Populated
            })),
            stats: {
                totalOrders,
                totalSpent,
                avgOrderValue,
                lastOrderDate: lastOrder?.createdAt || null,
            },
        };
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}

// Get customer statistics
export async function getCustomerStats() {
    try {
        await dbConnect();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const startOfMonth = new Date(currentYear, currentMonth, 1);

        const [totalCustomers, newThisMonth] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            User.countDocuments({ role: 'USER', createdAt: { $gte: startOfMonth } })
        ]);

        const { Order } = await import('@/lib/models/Order');
        const userIds = await Order.distinct('userId');
        const withOrdersCount = userIds.length; // Approximate, as some might be defaults or guests if allowed

        return {
            totalCustomers,
            newThisMonth,
            withOrders: withOrdersCount,
            withoutOrders: Math.max(0, totalCustomers - withOrdersCount),
        };
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        return {
            totalCustomers: 0,
            newThisMonth: 0,
            withOrders: 0,
            withoutOrders: 0,
        };
    }
}
