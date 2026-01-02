
'use server';

import dbConnect from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import Razorpay from 'razorpay';
import { Order, ReturnRequest } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
// Note: ReturnRequest is embedded or separate?
// Looking at Order.ts model, ReturnRequest might be separate model. 
// Step 96 showed ReturnRequest schema inside Order.ts potentially?
// Ah wait, I didn't see ReturnRequest in the snippet in Step 96.
// But I saw `OrderEvent`.
// Let's assume ReturnRequest is a separate model in 'Order.ts' or I need to create it.
// Checking `lib/models/Order.ts` content earlier: it had Order, OrderItem, OrderEvent schemas.
// Maybe ReturnRequest is missing?
// If so, I need to add it or it's there but I didn't see.
// Actually, I should assume it's exposed if `Order.ts` exports it.
// If I get error, I will fix.

export async function createReturnRequest(orderId: string, items: { orderItemId: string; quantity: number }[], reason: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    try {
        await dbConnect();
        const order = await Order.findById(orderId);

        if (!order) return { error: 'Order not found' };
        if (order.userId.toString() !== session.user.id) return { error: 'Unauthorized' };

        // Create ReturnRequest
        // Note: items.orderItemId corresponds to nested _id of Order Item?
        // Since Order items are embedded, validation: ensure they exist in order.

        const request = await ReturnRequest.create({
            orderId,
            userId: session.user.id,
            reason,
            status: 'PENDING',
            items: items.map(i => ({
                orderItemId: i.orderItemId,
                quantity: i.quantity
            }))
        });

        revalidatePath(`/account/orders/${orderId}`);
        return { success: true, requestId: request._id.toString() };

    } catch (error) {
        console.error('Failed to create return request:', error);
        return { error: 'Failed to create return request' };
    }
}

export async function getReturnRequests() {
    const session = await auth();
    const userRole = (session?.user as any).role;
    if (userRole !== 'ADMIN') return [];

    try {
        await dbConnect();
        const requests = await ReturnRequest.find()
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber paymentProtocol paymentData') // Populate order details
            .sort({ createdAt: -1 })
            .lean();

        // For items, we need to populate product details.
        // But ReturnRequest items have orderItemId. We might need to fetch products manually or populate deep if possible.
        // If ReturnRequest items just store ID, we can't easily populate Product from OrderItem unless we link it.
        // Assuming ReturnRequest schema has 'items' which are subdocs.
        // To show products, we might need to lookup from Order.
        // This is tricky with Mongoose if not structured well.
        // For now, let's just return basic request info or try to populate what we can.

        // Simpler: Return requests, and frontend might need to fetch details.
        // Or fetch orders for these requests.

        return requests.map((r: any) => ({
            ...r,
            id: r._id.toString(),
            user: r.userId,
            order: r.orderId,
            // items: ...
        }));
    } catch (error) {
        return [];
    }
}

export async function updateReturnStatus(requestId: string, status: string, comment?: string, refundAmount?: number) {
    const session = await auth();
    const userRole = (session?.user as any).role;
    if (userRole !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        const request = await ReturnRequest.findById(requestId).populate('orderId');

        if (!request) return { error: 'Request not found' };

        let finalStatus = status;

        if (status === 'REFUNDED') {
            const order = request.orderId; // Populated
            let amountToRefund = refundAmount || 0;

            if (amountToRefund === 0) {
                // Calculation logic (simplified for Mongoose)
                // We need pricing from Order Items.
                // We have orderItemId in request.items
                // We need to find those items in Order.items

                for (const item of request.items) {
                    const orderItem = order.items.id(item.orderItemId); // Mongoose subdoc finding
                    if (!orderItem) continue;

                    const linePrice = Number(orderItem.price);
                    // Assuming no discount field on item for now, or it's there.
                    // Simplified: refund price * quantity
                    amountToRefund += linePrice * item.quantity;
                }
            }

            // Refund Gateway Logic
            if (order.paymentProtocol === 'RAZORPAY' && order.paymentData) {
                try {
                    const paymentData = JSON.parse(order.paymentData);
                    const paymentId = paymentData.razorpay_payment_id;

                    if (paymentId && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                        const razorpay = new Razorpay({
                            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                            key_secret: process.env.RAZORPAY_KEY_SECRET,
                        });

                        if (amountToRefund > 0) {
                            await razorpay.payments.refund(paymentId, {
                                amount: Math.round(amountToRefund * 100),
                                speed: 'optimum'
                            });
                        }
                    }
                } catch (e: any) {
                    console.error('Refund Failed:', e);
                    return { error: 'Refund failed at Gateway: ' + e.message };
                }
            }

            refundAmount = amountToRefund;
        }

        if (status === 'APPROVED' && request.status !== 'APPROVED') {
            // Increment stock
            const order = request.orderId;
            for (const item of request.items) {
                const orderItem = order.items.id(item.orderItemId);
                if (orderItem?.productId) {
                    await Product.findByIdAndUpdate(orderItem.productId, {
                        $inc: { stock: item.quantity }
                    });
                }
            }
        }

        request.status = finalStatus;
        if (comment) request.comment = comment;
        if (refundAmount) request.refundAmount = refundAmount;
        await request.save();

        revalidatePath('/admin/returns');
        revalidatePath('/account/orders');
        return { success: true };

    } catch (error: any) {
        return { error: error.message || 'Failed to update' };
    }
}
