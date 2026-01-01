'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface OrderWithDetails {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    };
    shippingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    } | null;
    items: {
        id: string;
        quantity: number;
        price: number;
        product: {
            id: string;
            name_en: string;
            images: string;
        };
    }[];
    events: {
        id: string;
        status: string;
        note: string | null;
        createdAt: Date;
    }[];
}

// Get all orders with filters and pagination
export async function getOrders(filters?: {
    status?: string;
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

        const where: any = {};

        // Status filter
        if (filters?.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        // Search filter (order number or user email)
        if (filters?.search) {
            where.OR = [
                { orderNumber: { contains: filters.search } },
                { user: { email: { contains: filters.search } } },
                { user: { name: { contains: filters.search } } },
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

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name_en: true,
                                    images: true,
                                },
                            },
                        },
                    },
                    shippingAddress: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        // Convert Decimal to number
        // Convert Decimal to number
        const parsedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            status: order.status,
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shippingCost: Number(order.shippingCost),
            total: Number(order.total),
            createdAt: order.createdAt,
            user: order.user,
            shippingAddress: order.shippingAddress,
            // discountTotal might be needed if displayed in list
            discountTotal: Number(order.discountTotal || 0),
            items: order.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: Number(item.price),
                // Fix: explicit convert discount
                discount: Number(item.discount || 0),
                product: {
                    id: item.product.id,
                    name_en: item.product.name_en,
                    images: JSON.parse(item.product.images || '[]'),
                },
            })),
        }));

        return {
            orders: parsedOrders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            orders: [],
            total: 0,
            pages: 0,
            currentPage: 1,
        };
    }
}

// Get single order by ID with full details
export async function getOrderById(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name_en: true,
                                images: true,
                                sku: true,
                            },
                        },
                    },
                },
                events: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!order) {
            return null;
        }

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            status: order.status,
            shippingAddressId: order.shippingAddressId,
            billingAddressId: order.billingAddressId,
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shippingCost: Number(order.shippingCost),
            total: Number(order.total),
            paymentProtocol: order.paymentProtocol,
            paymentData: order.paymentData,
            shippingProtocol: order.shippingProtocol,
            shippingData: order.shippingData,
            couponCode: order.couponCode,
            discountTotal: Number(order.discountTotal || 0),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            user: order.user,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            events: order.events,
            items: order.items.map(item => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.price),
                discount: Number(item.discount || 0),
                attributes: item.attributes,
                product: {
                    id: item.product.id,
                    name_en: item.product.name_en,
                    images: JSON.parse(item.product.images || '[]'),
                    sku: item.product.sku
                },
            })),
        } as any;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

// Update order status
export async function updateOrderStatus(
    orderId: string,
    status: string,
    note?: string
) {
    try {
        // Valid status transitions
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return { error: 'Invalid status' };
        }

        // Update order and create event in a transaction
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status },
            }),
            prisma.orderEvent.create({
                data: {
                    orderId,
                    status,
                    note: note || null,
                },
            }),
        ]);

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/account/orders');
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { error: 'Failed to update order status' };
    }
}

// Get order statistics for dashboard
export async function getOrderStats() {
    try {
        const [
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            totalRevenue,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PROCESSING' } }),
            prisma.order.count({ where: { status: 'SHIPPED' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.aggregate({
                _sum: {
                    total: true,
                },
                where: {
                    status: {
                        not: 'CANCELLED',
                    },
                },
            }),
        ]);

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            totalRevenue: Number(totalRevenue._sum.total || 0),
        };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0,
        };
    }
}

// Cancel order
export async function cancelOrder(orderId: string, reason?: string) {
    try {
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
            }),
            prisma.orderEvent.create({
                data: {
                    orderId,
                    status: 'CANCELLED',
                    note: reason || 'Order cancelled',
                },
            }),
        ]);

        revalidatePath('/orders');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { error: 'Failed to cancel order' };
    }
}
// Get abandoned checkouts (orders in PENDING for > 1 hour)
export async function getAbandonedCheckouts() {
    try {
        const threshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

        const orders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: threshold,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name_en: true,
                                images: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            status: order.status,
            total: Number(order.total),
            createdAt: order.createdAt,
            user: order.user,
            items: order.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: Number(item.price),
                product: {
                    id: item.product.id,
                    name_en: item.product.name_en,
                    images: JSON.parse(item.product.images || '[]'),
                },
            })),
        }));
    } catch (error) {
        console.error('Error fetching abandoned checkouts:', error);
        return [];
    }
}

/**
 * Admin action: Send a recovery email for an abandoned checkout.
 */
export async function sendRecoveryEmail(orderId: string) {
    try {
        const { resend } = await import('@/lib/resend');
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order || !order.user?.email) {
            return { error: 'Order or customer email not found.' };
        }

        const itemsList = order.items.map(item => `<li>${item.product.name_en} x ${item.quantity}</li>`).join('');
        const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${order.id}`;

        await resend.emails.send({
            from: 'Aaavrti <orders@aaavrti.com>',
            to: order.user.email,
            subject: 'Did you forget something?',
            html: `
                <div style="font-family: serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333; text-align: center;">Your cart is waiting...</h2>
                    <p>Hi ${order.user.name || 'there'},</p>
                    <p>We noticed you left some beautiful items in your cart. They are still available, but they might sell out soon!</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <ul style="list-style: none; padding: 0;">
                            ${itemsList}
                        </ul>
                        <p style="font-weight: bold; margin-top: 10px;">Total: ₹${Number(order.total).toLocaleString('en-IN')}</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${checkoutUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; display: inline-block;">Complete My Purchase</a>
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 40px; text-align: center;">
                        If you have any questions, just reply to this email. We're here to help!
                    </p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending recovery email:', error);
        return { error: 'Failed to send recovery email' };
    }
}
