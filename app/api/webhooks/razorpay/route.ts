import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order, ReturnRequest } from '@/lib/models/Order'; // Order and ReturnRequest are in Order.ts? Check Marketing.ts or similar if confusing.
// In Return-actions, we imported ReturnRequest from somewhere.
// Models were: Order, ReturnRequest in Order.ts usually or separate?
// I see I used `ReturnRequest` in `return-actions.ts`.
// Let's assume they are exported from their respective files. Best is `import { Order, ReturnRequest } from '@/lib/models/Order';` if they are defined there.
// If ReturnRequest is in a separate file, I should check.
// In `return-actions.ts` I likely used: `import { Order, ReturnRequest } from '@/lib/models/Order';`
// Let's verified models structure in previous turns.
// Yes, usually Order and ReturnRequest are grouped.

import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        // Verify webhook signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'Kamli@1968';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('[Razorpay Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        console.log('[Razorpay Webhook] Event received:', event.event);

        await dbConnect();

        // Handle different event types
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;

            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;

            case 'refund.processed':
                await handleRefundProcessed(event.payload.refund.entity);
                break;

            case 'refund.failed':
                await handleRefundFailed(event.payload.refund.entity);
                break;

            case 'order.paid':
                await handleOrderPaid(event.payload.order.entity, event.payload.payment.entity);
                break;

            default:
                console.log(`[Razorpay Webhook] Unhandled event: ${event.event}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Razorpay Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handlePaymentCaptured(payment: any) {
    console.log('[Razorpay] Payment captured:', payment.id);
    // Payment is already captured in verifyPayment action
}

async function handlePaymentFailed(payment: any) {
    console.log('[Razorpay] Payment failed:', payment.id);

    // Find order by Razorpay order ID
    const razorpayOrderId = payment.order_id;

    // Search in paymentData string
    const order = await Order.findOne({
        paymentData: { $regex: razorpayOrderId, $options: 'i' }
    });

    if (order && order.status === 'PENDING') {
        order.status = 'CANCELLED';
        await order.save();
        console.log(`[Razorpay] Order ${order._id} marked as CANCELLED due to payment failure`);
    }
}

async function handleRefundProcessed(refund: any) {
    console.log('[Razorpay] Refund processed:', refund.id);

    // Find return request by payment ID
    const paymentId = refund.payment_id;

    // We need to find the ReturnRequest associated with the Order that has this paymentId
    // This is complex in NoSQL if not directly linked.
    // ReturnRequests have `orderId`.
    // We first find the Order with this paymentId.
    const order = await Order.findOne({
        paymentData: { $regex: paymentId, $options: 'i' }
    });

    if (order) {
        const returnRequest = await ReturnRequest.findOne({
            orderId: order._id,
            status: 'APPROVED'
        });

        if (returnRequest) {
            returnRequest.status = 'REFUNDED';
            returnRequest.refundAmount = refund.amount / 100;
            returnRequest.comment = `Refund processed: ${refund.id}`;
            await returnRequest.save();
            console.log(`[Razorpay] Return request ${returnRequest._id} marked as REFUNDED`);
        }
    }
}

async function handleRefundFailed(refund: any) {
    console.log('[Razorpay] Refund failed:', refund.id);

    // Log error for manual intervention
    console.error('[Razorpay] Refund failed details:', {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        error: refund.error_description
    });
}

async function handleOrderPaid(order: any, payment: any) {
    console.log('[Razorpay] Order paid:', order.id);
    // This is handled by verifyPayment action
}
