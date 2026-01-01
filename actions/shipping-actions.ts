
'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Helper to authenticate with Shiprocket
async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) return null;

    try {
        const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        return data.token;
    } catch (e) {
        console.error('Shiprocket Auth Error:', e);
        return null;
    }
}

export async function shipOrder(orderId: string, provider: string = 'Shiprocket') {
    const session = await auth();
    // if ((session?.user as any).role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { shippingAddress: true, items: { include: { product: true } } }
        });
        if (!order) return { error: 'Order not found' };

        if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
            return { error: 'Order must be CONFIRMED or PROCESSING to ship' };
        }

        let trackingId = '';
        let awbCode = '';
        let shippingMetadata: any = {};

        // Try Real Shiprocket API
        const token = await getShiprocketToken();
        if (token && order.shippingAddress) {
            try {
                // STEP 1: Fetch Pickup Locations
                let pickupLocation = "Primary";
                try {
                    const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const pickupData = await pickupRes.json();
                    if (pickupData.data && pickupData.data.shipping_address && pickupData.data.shipping_address.length > 0) {
                        pickupLocation = pickupData.data.shipping_address[0].pickup_location;
                    }
                } catch (e) {
                    console.warn('Failed to fetch pickup locations, using default "Primary"');
                }

                // Format Phone (Remove non-digits, ensure 10+ digits)
                let phone = order.shippingAddress.phone.replace(/\D/g, '');
                if (phone.length < 10) phone = "9999999999";

                // STEP 2: Create Order (adhoc)
                const payload = {
                    order_id: order.orderNumber,
                    order_date: order.createdAt.toISOString().split('T')[0],
                    pickup_location: pickupLocation,
                    channel_id: "9340144",
                    billing_customer_name: order.shippingAddress.name.split(' ')[0],
                    billing_last_name: order.shippingAddress.name.split(' ').slice(1).join(' ') || '.',
                    billing_address: order.shippingAddress.street,
                    billing_city: order.shippingAddress.city,
                    billing_pincode: order.shippingAddress.postalCode,
                    billing_state: order.shippingAddress.state,
                    billing_country: "India",
                    billing_email: session?.user?.email || "customer@example.com",
                    billing_phone: phone,
                    shipping_is_billing: true,
                    order_items: order.items.map(item => ({
                        name: item.product.name_en,
                        sku: item.product.sku || "SKU-" + item.productId.slice(0, 5),
                        units: item.quantity,
                        selling_price: Number(item.price),
                        discount: 0,
                        tax: 0,
                        hsn: 0
                    })),
                    payment_method: order.paymentProtocol === 'RAZORPAY' ? 'Prepaid' : 'COD',
                    sub_total: Number(order.total),
                    length: 10, breadth: 10, height: 10, weight: 0.5
                };

                console.log('[SHIPROCKET] Creating order...');
                const shipRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const shipData = await shipRes.json();
                console.log('[SHIPROCKET] Order creation response:', shipData);

                if (!shipData.order_id || !shipData.shipment_id) {
                    throw new Error(shipData.message || 'Failed to create Shiprocket order');
                }

                const shiprocketOrderId = shipData.order_id;
                const shipmentId = shipData.shipment_id;

                // STEP 3: Assign AWB (Courier)
                console.log('[SHIPROCKET] Assigning AWB for shipment:', shipmentId);
                const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ shipment_id: shipmentId })
                });

                const awbData = await awbRes.json();
                console.log('[SHIPROCKET] AWB assignment response:', awbData);

                if (awbData.awb_assign_status === 1 && awbData.response && awbData.response.data) {
                    awbCode = awbData.response.data.awb_code;
                    trackingId = awbCode;
                    console.log('[SHIPROCKET] AWB assigned:', awbCode);
                } else {
                    console.warn('[SHIPROCKET] AWB assignment failed, using order ID as tracking');
                    trackingId = `SR-${shiprocketOrderId}`;
                }

                // STEP 4: Generate Pickup
                console.log('[SHIPROCKET] Generating pickup...');
                try {
                    const pickupGenRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ shipment_id: [shipmentId] })
                    });
                    const pickupGenData = await pickupGenRes.json();
                    console.log('[SHIPROCKET] Pickup generation response:', pickupGenData);
                } catch (e) {
                    console.warn('[SHIPROCKET] Pickup generation failed (non-critical):', e);
                }

                // STEP 5: Generate Manifest (optional but recommended)
                console.log('[SHIPROCKET] Generating manifest...');
                try {
                    const manifestRes = await fetch('https://apiv2.shiprocket.in/v1/external/manifests/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ shipment_id: [shipmentId] })
                    });
                    const manifestData = await manifestRes.json();
                    console.log('[SHIPROCKET] Manifest generation response:', manifestData);
                } catch (e) {
                    console.warn('[SHIPROCKET] Manifest generation failed (non-critical):', e);
                }

                shippingMetadata = {
                    shiprocketOrderId,
                    shipmentId,
                    awbCode,
                    courierName: awbData.response?.data?.courier_name || 'Unknown',
                    ...shipData
                };
                provider = 'Shiprocket (Live)';

            } catch (e: any) {
                console.error('[SHIPROCKET] API Error:', e);
                return { error: 'Shiprocket API Failed: ' + e.message };
            }
        }

        // Simulation Fallback (Only if no token configured)
        if (!trackingId) {
            if (process.env.SHIPROCKET_EMAIL) {
                return { error: 'Shiprocket Validation Failed' };
            }
            trackingId = 'TRACK-' + Math.random().toString(36).substring(7).toUpperCase();
            provider = 'Shiprocket (Simulated)';
        }

        // Update Order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'SHIPPED',
                shippingProtocol: provider,
                shippingData: JSON.stringify({
                    trackingId,
                    awbCode,
                    provider,
                    shippedAt: new Date().toISOString(),
                    metadata: shippingMetadata
                })
            }
        });

        console.log(`[SHIPROCKET] Order ${orderId} shipped successfully with tracking: ${trackingId}`);

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        revalidatePath('/account/orders');
        return { success: true, trackingId, awbCode };

    } catch (error: any) {
        console.error('[SHIPROCKET] shipOrder error:', error);
        return { error: error.message };
    }
}

export async function deliverOrder(orderId: string) {
    // Admin manually marking as Delivered (or Webhook)
    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' }
    });
    revalidatePath(`/admin/orders/${orderId}`);
}
