import { shipOrder } from '../actions/shipping-actions';

async function main() {
    const orderId = process.argv[2];

    if (!orderId) {
        console.error('Usage: npx ts-node scripts/manual-ship.ts <ORDER_ID>');
        process.exit(1);
    }

    console.log(`Shipping order: ${orderId}`);

    try {
        const result = await shipOrder(orderId);

        if (result.success) {
            console.log('✅ Order shipped successfully!');
            console.log('Tracking ID:', result.trackingId);
        } else {
            console.error('❌ Shipping failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();
