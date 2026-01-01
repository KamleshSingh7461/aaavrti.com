import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
    // This is just for logging/monitoring
}

async function handlePaymentFailed(payment: any) {
    console.log('[Razorpay] Payment failed:', payment.id);

    // Find order by Razorpay order ID
    const razorpayOrderId = payment.order_id;

    const order = await prisma.order.findFirst({
        where: {
            paymentData: {
                contains: razorpayOrderId
            }
        }
    });

    if (order && order.status === 'PENDING') {
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
        });
        console.log(`[Razorpay] Order ${order.id} marked as CANCELLED due to payment failure`);
    }
}

async function handleRefundProcessed(refund: any) {
    console.log('[Razorpay] Refund processed:', refund.id);

    // Find return request by payment ID
    const paymentId = refund.payment_id;

    const returnRequest = await prisma.returnRequest.findFirst({
        where: {
            order: {
                paymentData: {
                    contains: paymentId
                }
            },
            status: 'APPROVED'
        }
    });

    if (returnRequest) {
        await prisma.returnRequest.update({
            where: { id: returnRequest.id },
            data: {
                status: 'REFUNDED',
                refundAmount: refund.amount / 100, // Convert paise to rupees
                comment: `Refund processed: ${refund.id}`
            }
        });
        console.log(`[Razorpay] Return request ${returnRequest.id} marked as REFUNDED`);
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
    // Just log for monitoring
}
