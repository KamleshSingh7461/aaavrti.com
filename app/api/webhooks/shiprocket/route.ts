
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic Security Check (Optional: verify x-shiprocket-token if configured)
        // const token = req.headers.get('x-shiprocket-token');
        // if (token !== process.env.SHIPROCKET_TOKEN) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { current_status, order_id, awb } = body;

        // Shiprocket order_id might be different from our internal orderNumber if mapped differently.
        // But we sent `order_id: order.orderNumber` in payload, so Shiprocket should respect it as "channel_order_id" or "order_id"?
        // Shiprocket API Response returns `order_id` (Shiprocket ID).
        // The Webhook `order_id` is usually the Shiprocket Order ID or "1373900_150876814" format?
        // Wait, documentation example: "order_id":"1373900_150876814", "sr_order_id":348456385.
        // It seems `order_id` in webhook might be OUR order id + mapping?
        // Or "1373900" is Channel ID?

        // Let's assume we can match by `orderNumber` OR use `trackingId` stored in metadata?
        // We stored `trackingId` which is `awb_code` or `SR-ID`.

        // Strategy: Find Order where `shippingData` contains this AWB or Shiprocket ID.
        // Since `shippingData` is JSON string, checking contains might be inefficient but robust enough for individual updates.
        // Ideally we should have stored `awb` in a separate column, but for now filtering is okay or we search by `orderNumber`.

        // If we assumed we sent `order_id` as our `orderNumber`.
        // Let's try to match `orderNumber` from the webhook payload if possible.
        // Does `order_id` in webhook return what we sent? 
        // Docs say: "The order_id defined by you at the time of order creation is your reference order id. The order_id returned in the API response is the Shiprocket order id."
        // Webhook example: "order_id":"1373900_150876814". This looks like composite.

        // SAFER: Match by AWB.
        const targetOrder = await prisma.order.findFirst({
            where: {
                shippingData: {
                    contains: awb
                }
            }
        });

        if (!targetOrder) {
            console.log('Webhook: Order not found for AWB', awb);
            return NextResponse.json({ message: 'Order not found' }, { status: 200 });
        }

        let newStatus = targetOrder.status;

        // Map Status
        // current_status: "DELIVERED", "CANCELED", "RTO INITIATED", "RTO DELIVERED"
        const statusUpper = current_status?.toUpperCase() || '';

        if (statusUpper === 'DELIVERED') {
            newStatus = 'DELIVERED';
        } else if (statusUpper === 'CANCELED') {
            newStatus = 'CANCELLED';
        } else if (statusUpper.includes('RTO')) {
            // RTO
            // Maybe we have a 'RETURNED' status or keep 'SHIPPED' with Note?
            // Schema has PENDING, APPROVED, REJECTED, REFUNDED for ReturnRequest.
            // Order Status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED.
            // Maybe we should add 'RETURNED' to Order Status enum?
            // For now, log it as Event.
        }

        if (newStatus !== targetOrder.status) {
            await prisma.$transaction([
                prisma.order.update({
                    where: { id: targetOrder.id },
                    data: { status: newStatus }
                }),
                prisma.orderEvent.create({
                    data: {
                        orderId: targetOrder.id,
                        status: newStatus,
                        note: `Shiprocket Update: ${statusUpper} (AWB: ${awb})`
                    }
                })
            ]);

            revalidatePath(`/admin/orders/${targetOrder.id}`);
            revalidatePath('/account/orders');
        } else {
            // Just Log Event for significant non-status updates?
            // e.g. "PICKED UP"
            await prisma.orderEvent.create({
                data: {
                    orderId: targetOrder.id,
                    status: targetOrder.status,
                    note: `Shiprocket Update: ${statusUpper} (AWB: ${awb})`
                }
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e) {
        console.error('Webhook Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
