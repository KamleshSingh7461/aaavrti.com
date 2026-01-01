import { prisma } from '../lib/db';
import { shipOrder } from '../actions/shipping-actions';

async function main() {
    // Find the latest CONFIRMED order
    const order = await prisma.order.findFirst({
        where: { status: 'CONFIRMED' },
        orderBy: { createdAt: 'desc' }
    });

    if (!order) {
        console.log('No CONFIRMED orders found');
        return;
    }

    console.log(`Found order: ${order.orderNumber} (${order.id})`);
    console.log(`Total: ₹${order.total}`);
    console.log('\nShipping via Shiprocket...');

    try {
        const result = await shipOrder(order.id);

        if (result.success) {
            console.log('\n✅ Order shipped successfully!');
            console.log('Tracking ID:', result.trackingId);
            console.log('\nRefresh the admin page to see tracking info!');
        } else {
            console.error('\n❌ Shipping failed:', result.error);
        }
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
    }

    await prisma.$disconnect();
}

main();
