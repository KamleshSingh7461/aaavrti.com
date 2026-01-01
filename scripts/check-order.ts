import { prisma } from '../lib/db';

async function main() {
    const order = await prisma.order.findFirst({
        where: { orderNumber: { contains: '6b0a8e99' } }
    });

    if (!order) {
        console.log('Order not found');
        return;
    }

    console.log('Order:', order.orderNumber);
    console.log('Status:', order.status);
    console.log('Has shipping data:', !!order.shippingData);

    if (order.shippingData) {
        const data = JSON.parse(order.shippingData);
        console.log('Tracking ID:', data.trackingId || 'N/A');
        console.log('AWB Code:', data.awbCode || 'N/A');
    } else {
        console.log('❌ NO TRACKING DATA - Order was manually marked as SHIPPED');
    }

    await prisma.$disconnect();
}

main();
