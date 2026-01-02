
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic Security Check (Optional: verify x-shiprocket-token if configured)
        // const token = req.headers.get('x-shiprocket-token');
        // if (token !== process.env.SHIPROCKET_TOKEN) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { current_status, order_id, awb } = body;

        // Connect to DB
        await dbConnect();

        // SAFER: Match by AWB.
        // In Mongoose, we can use regex or FindOne.
        // `shippingData` is likely a stringified JSON if migrated from Prisma text field, OR it could be an object if we defined it as Schema.Types.Mixed or proper schema.
        // In `Order.ts` schema, `shippingData` is defined as String (if I recall correctly how we migrated).
        // Let's check matching. Regex is safer if it's stringified.

        const targetOrder = await Order.findOne({
            shippingData: { $regex: awb, $options: 'i' }
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
            // RTO logic reserved
        }

        if (newStatus !== targetOrder.status) {
            targetOrder.status = newStatus;

            // Push to events
            targetOrder.events = targetOrder.events || [];
            targetOrder.events.push({
                status: newStatus,
                note: `Shiprocket Update: ${statusUpper} (AWB: ${awb})`,
                createdAt: new Date()
            });

            await targetOrder.save();

            revalidatePath(`/admin/orders/${targetOrder._id}`);
            revalidatePath('/account/orders');
        } else {
            // Just Log Event
            targetOrder.events = targetOrder.events || [];
            targetOrder.events.push({
                status: targetOrder.status,
                note: `Shiprocket Update: ${statusUpper} (AWB: ${awb})`,
                createdAt: new Date()
            });
            await targetOrder.save();
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e) {
        console.error('Webhook Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
