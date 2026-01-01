'use server';

import { prisma } from '@/lib/db';

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
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
            role: 'USER', // Only get customers, not admins
        };

        // Search filter
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { email: { contains: filters.search } },
                { phone: { contains: filters.search } },
            ];
        }

        // Date range filter
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }

        const [customers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            orders: true,
                        },
                    },
                    orders: {
                        select: {
                            total: true,
                            status: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        // Calculate total spent for each customer
        const customersWithStats = customers.map(customer => {
            const totalSpent = customer.orders
                .filter(order => order.status !== 'CANCELLED')
                .reduce((sum, order) => sum + Number(order.total), 0);

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                createdAt: customer.createdAt,
                emailVerified: customer.emailVerified,
                _count: customer._count,
                totalSpent,
            };
        });

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
        const customer = await prisma.user.findUnique({
            where: { id },
            include: {
                addresses: true,
                orders: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name_en: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                reviews: {
                    include: {
                        product: {
                            select: {
                                name_en: true,
                            },
                        },
                    },
                },
            },
        });

        if (!customer) {
            return null;
        }

        // Calculate statistics
        const totalOrders = customer.orders.length;
        const totalSpent = customer.orders
            .filter(order => order.status !== 'CANCELLED')
            .reduce((sum, order) => sum + Number(order.total), 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const lastOrder = customer.orders[0] || null;

        return {
            ...customer,
            orders: customer.orders.map(order => ({
                ...order,
                subtotal: Number(order.subtotal),
                tax: Number(order.tax),
                shippingCost: Number(order.shippingCost),
                total: Number(order.total),
                items: order.items.map(item => ({
                    ...item,
                    price: Number(item.price),
                })),
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
        const [totalCustomers, newThisMonth, withOrders] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    orders: {
                        some: {},
                    },
                },
            }),
        ]);

        return {
            totalCustomers,
            newThisMonth,
            withOrders,
            withoutOrders: totalCustomers - withOrders,
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
