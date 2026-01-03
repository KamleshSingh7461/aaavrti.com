'use server';

import dbConnect from '@/lib/db';
import { Order, OrderEvent } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
// Ensure models are registered
import '@/lib/models/User';
import '@/lib/models/Product';

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
        await dbConnect();
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const query: any = {};

        // Status filter
        if (filters?.status && filters.status !== 'all') {
            query.status = filters.status;
        }

        // Search filter (order number or user email) - Needs lookup or separate query if User is separate. 
        // Order stores userId. To filter by User Name/Email, we might need aggregation or finding users first.
        // Simple approach: Filter by Order Number, or if search matches a User, find their orders.
        if (filters?.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            query.$or = [
                { orderNumber: searchRegex },
                // { 'user.email': ... } cannot do this easily without aggregate.
                // Leaving user search out for simple find, unless we use aggregate.
            ];

            // NOTE: If we really need user search, we should find User IDs first.
            // Using aggregate for migration completeness might be better but riskier. 
            // Stick to Order Number for now or basic improvements later.
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

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate({ path: 'user', select: 'name email phone' })
                .populate({
                    path: 'items',
                    populate: { path: 'productId', select: 'name_en images' } // nested populate 
                })
                .populate('shippingAddress')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true }), // Enable virtuals in lean
            Order.countDocuments(query),
        ]);

        // Convert to interface
        const parsedOrders = orders.map((order: any) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: order.userId.toString(),
            status: order.status,
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shippingCost: Number(order.shippingCost),
            total: Number(order.total),
            createdAt: order.createdAt,
            user: order.user ? {
                id: order.user._id.toString(),
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone
            } : { id: '', name: '', email: '', phone: '' },
            shippingAddress: order.shippingAddress ? { ...order.shippingAddress, id: order.shippingAddress._id?.toString() } : null,
            discountTotal: Number(order.discountTotal || 0),
            items: (order.items || []).map((item: any) => ({
                id: item._id.toString(),
                quantity: item.quantity,
                price: Number(item.price),
                discount: Number(item.discount || 0),
                product: item.productId ? {
                    id: item.productId._id.toString(),
                    name_en: item.productId.name_en,
                    images: item.productId.images
                } : { id: '', name_en: 'Unknown', images: [] },
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
        await dbConnect();
        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate({
                path: 'items',
                populate: { path: 'productId', select: 'name_en images sku' }
            })
            .populate({ path: 'events', options: { sort: { createdAt: -1 } } })
            .lean({ virtuals: true });

        if (!order) {
            return null;
        }

        return {
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: order.userId.toString(),
            status: order.status,
            shippingAddressId: order.shippingAddressId ? order.shippingAddressId.toString() : null,
            billingAddressId: order.billingAddressId ? order.billingAddressId.toString() : null,
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
            events: (order.events || []).map((e: any) => ({ ...e, id: e._id.toString() })),
            items: (order.items || []).map((item: any) => ({
                id: item._id.toString(),
                orderId: (item.orderId || order._id).toString(),
                productId: (item.productId && typeof item.productId === 'object' && '_id' in item.productId) ? (item.productId as any)._id.toString() : (item.productId as string),
                quantity: item.quantity,
                price: Number(item.price),
                discount: Number(item.discount || 0),
                attributes: item.attributes,
                product: (item.productId && typeof item.productId === 'object' && 'name_en' in item.productId) ? {
                    id: (item.productId as any)._id.toString(),
                    name_en: (item.productId as any).name_en,
                    images: (item.productId as any).images,
                    sku: (item.productId as any).sku
                } : null,
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
        await dbConnect();
        // Valid status transitions
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return { error: 'Invalid status' };
        }

        // Mongoose Transaction? Or just sequence. 
        // Transactions require replica set. Assuming standard Mongo setup, might not have replica set locally.
        // Safer to just await sequentially for migration unless strict consistency needed.

        await Order.findByIdAndUpdate(orderId, { status });

        await OrderEvent.create({
            orderId,
            status,
            note: note || null
        });

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
        await dbConnect();
        const [
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            totalRevenueAgg,
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'PENDING' }),
            Order.countDocuments({ status: 'PROCESSING' }),
            Order.countDocuments({ status: 'SHIPPED' }),
            Order.countDocuments({ status: 'DELIVERED' }),
            Order.aggregate([
                { $match: { status: { $ne: 'CANCELLED' } } },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),
        ]);

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            totalRevenue: totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0,
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
        await dbConnect();
        await Order.findByIdAndUpdate(orderId, { status: 'CANCELLED' });

        await OrderEvent.create({
            orderId,
            status: 'CANCELLED',
            note: reason || 'Order cancelled'
        });

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
        await dbConnect();
        const threshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

        const orders = await Order.find({
            status: 'PENDING',
            createdAt: { $lt: threshold }
        })
            .populate('user', 'name email phone')
            .populate({
                path: 'items',
                populate: { path: 'productId', select: 'name_en images' }
            })
            .sort({ createdAt: -1 })
            .lean({ virtuals: true }); // Need virtuals if items are virtual

        return orders.map((order: any) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            userId: order.userId.toString(),
            status: order.status,
            total: Number(order.total),
            createdAt: order.createdAt,
            user: order.user,
            items: (order.items || []).map((item: any) => ({
                id: item._id.toString(),
                quantity: item.quantity,
                price: Number(item.price),
                product: item.productId ? {
                    id: item.productId._id.toString(),
                    name_en: item.productId.name_en,
                    images: item.productId.images // Assumed array/json structure
                } : null,
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
        await dbConnect();

        const order = await Order.findById(orderId)
            .populate('user')
            .populate({
                path: 'items',
                populate: { path: 'productId' }
            })
            .lean({ virtuals: true });

        if (!order || !order.user?.email) {
            return { error: 'Order or customer email not found.' };
        }

        const itemsList = (order.items || []).map((item: any) => `<li>${item.productId?.name_en || 'Product'} x ${item.quantity}</li>`).join('');
        const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${order._id}`;

        await resend.emails.send({
            from: 'Aaavrti <orders@aaavrti.com>',
            to: (order.user as any).email,
            subject: 'Did you forget something?',
            html: `
                <div style="font-family: serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333; text-align: center;">Your cart is waiting...</h2>
                    <p>Hi ${(order.user as any).name || 'there'},</p>
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
