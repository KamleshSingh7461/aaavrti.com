
import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/shiprocket';

async function main() {
    // Get AWB from command line args
    const awb = process.argv[2];
    const status = process.argv[3] || 'DELIVERED';

    if (!awb) {
        console.error('Usage: npx ts-node scripts/simulate-webhook.ts <AWB_CODE> [STATUS]');
        console.log('Example: npx ts-node scripts/simulate-webhook.ts SR-12345 DELIVERED');
        process.exit(1);
    }

    console.log(`Simulating Shiprocket Webhook for AWB: ${awb} with Status: ${status}`);

    try {
        const payload = {
            awb: awb,
            current_status: status,
            current_timestamp: new Date().toISOString(),
            order_id: "some-shiprocket-id",
            sr_order_id: 123456
        };

        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Webhook Response:', res.status, data);

    } catch (e) {
        console.error('Error sending webhook:', e);
    }
}

main();
