
'use server';

import Razorpay from 'razorpay';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

// Razorpay instance init moved inside function to avoid build/runtime error if keys missing

export async function createRazorpayOrder(orderId: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay Keys Missing');
        return { error: 'Payment Gateway Configuration Missing' };
    }

    const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) return { error: 'Order not found' };
        if (order.status !== 'PENDING') return { error: 'Order is not in pending state' };
        if (order.userId !== session.user.id) return { error: 'Unauthorized' };

        const amountInPaise = Math.round(Number(order.total) * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.id,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Update order with payment init details if needed
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentProtocol: 'RAZORPAY',
                paymentData: JSON.stringify({ razorpayOrderId: razorpayOrder.id })
            }
        });

        return {
            success: true,
            orderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        };

    } catch (error) {
        console.error('Razorpay Init Error:', error);
        return { error: 'Failed to initiate payment' };
    }
}

export async function verifyPayment(response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    internalOrderId: string;
}) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internalOrderId } = response;

    if (!process.env.RAZORPAY_KEY_SECRET) return { error: 'Server Config Missing', success: false };

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update DB
        await prisma.order.update({
            where: { id: internalOrderId },
            data: {
                status: 'CONFIRMED', // Or LOADING/PROCESSING
                paymentData: JSON.stringify({
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    status: 'captured'
                })
            }
        });

        // Auto-ship online orders after payment confirmation
        try {
            const { shipOrder } = await import('./shipping-actions');
            await shipOrder(internalOrderId);
            console.log(`[AUTO-SHIP] Online Order ${internalOrderId} shipped automatically after payment`);
        } catch (shipError) {
            console.error(`[AUTO-SHIP] Failed to auto-ship order ${internalOrderId}:`, shipError);
            // Don't fail the payment verification if shipping fails
        }

        revalidatePath(`/checkout/success/${internalOrderId}`);
        return { success: true };
    } else {
        return { error: 'Payment verification failed', success: false };
    }
}
