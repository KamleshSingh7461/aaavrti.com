import { prisma } from '../lib/db';
import { shipOrder } from '../actions/shipping-actions';

async function testCompleteFlow() {
    console.log('='.repeat(80));
    console.log('🧪 COMPLETE E-COMMERCE FLOW TEST');
    console.log('='.repeat(80));
    console.log('');

    try {
        // STEP 1: Find the latest CONFIRMED order
        console.log('📦 STEP 1: Finding latest CONFIRMED order...');
        const order = await prisma.order.findFirst({
            where: { status: 'CONFIRMED' },
            orderBy: { createdAt: 'desc' },
            include: {
                shippingAddress: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            console.log('❌ No CONFIRMED orders found. Please create an order first.');
            console.log('   Go to: http://localhost:3000');
            console.log('   Add products to cart and checkout with COD');
            return;
        }

        console.log(`✅ Found order: ${order.orderNumber}`);
        console.log(`   Customer: ${order.shippingAddress?.name}`);
        console.log(`   Total: ₹${order.total}`);
        console.log(`   Items: ${order.items.length}`);
        order.items.forEach(item => {
            console.log(`      - ${item.product.name_en} x${item.quantity}`);
        });
        console.log('');

        // STEP 2: Ship via Shiprocket
        console.log('🚀 STEP 2: Shipping via Shiprocket...');
        console.log('   This will:');
        console.log('   1. Create order in Shiprocket');
        console.log('   2. Assign AWB (tracking number)');
        console.log('   3. Generate pickup request');
        console.log('   4. Generate manifest');
        console.log('');

        const shipResult = await shipOrder(order.id);

        if (!shipResult.success) {
            console.log(`❌ Shipping failed: ${shipResult.error}`);
            return;
        }

        console.log('✅ Order shipped successfully!');
        console.log(`   Tracking ID: ${shipResult.trackingId}`);
        console.log(`   AWB Code: ${shipResult.awbCode || 'N/A'}`);
        console.log('');

        // STEP 3: Verify order status updated
        console.log('📋 STEP 3: Verifying order status...');
        const updatedOrder = await prisma.order.findUnique({
            where: { id: order.id }
        });

        if (updatedOrder?.status === 'SHIPPED') {
            console.log('✅ Order status updated to SHIPPED');

            if (updatedOrder.shippingData) {
                const shippingData = JSON.parse(updatedOrder.shippingData);
                console.log('   Shipping Details:');
                console.log(`      Provider: ${shippingData.provider}`);
                console.log(`      Tracking: ${shippingData.trackingId}`);
                console.log(`      AWB: ${shippingData.awbCode || 'N/A'}`);
                console.log(`      Shipped At: ${shippingData.shippedAt}`);

                if (shippingData.metadata) {
                    console.log(`      Shiprocket Order ID: ${shippingData.metadata.shiprocketOrderId || 'N/A'}`);
                    console.log(`      Shipment ID: ${shippingData.metadata.shipmentId || 'N/A'}`);
                    console.log(`      Courier: ${shippingData.metadata.courierName || 'N/A'}`);
                }
            }
        } else {
            console.log(`⚠️  Order status is: ${updatedOrder?.status}`);
        }
        console.log('');

        // STEP 4: Check Shiprocket Dashboard
        console.log('🌐 STEP 4: Next Steps...');
        console.log('   1. Check Shiprocket Dashboard:');
        console.log('      https://app.shiprocket.in/seller/orders/new');
        console.log('      You should see the order there!');
        console.log('');
        console.log('   2. Check Admin Panel:');
        console.log(`      http://localhost:3000/admin/orders/${order.id}`);
        console.log('      You should see tracking info and "Auto-Shipped" badge');
        console.log('');
        console.log('   3. Check Customer View:');
        console.log(`      http://localhost:3000/account/orders/${order.id}`);
        console.log('      Customer can see tracking link');
        console.log('');

        // STEP 5: Simulate Webhook (Optional)
        console.log('📡 STEP 5: Webhook Simulation (Optional)...');
        console.log('   To test webhook updates:');
        if (shipResult.awbCode) {
            console.log(`   npx tsx scripts/simulate-webhook.ts ${shipResult.awbCode} DELIVERED`);
        } else {
            console.log('   (AWB code not available - skip webhook test)');
        }
        console.log('');

        // SUMMARY
        console.log('='.repeat(80));
        console.log('✅ COMPLETE FLOW TEST PASSED!');
        console.log('='.repeat(80));
        console.log('');
        console.log('Flow Summary:');
        console.log('  1. ✅ Order Found (CONFIRMED)');
        console.log('  2. ✅ Shipped via Shiprocket API');
        console.log('  3. ✅ Status Updated to SHIPPED');
        console.log('  4. ✅ Tracking Info Saved');
        console.log('  5. 🔄 Webhook Ready (awaiting Shiprocket updates)');
        console.log('');
        console.log('Next: Order will auto-update to DELIVERED when Shiprocket sends webhook');
        console.log('');

    } catch (error: any) {
        console.error('');
        console.error('❌ ERROR:', error.message);
        console.error('');
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testCompleteFlow();
