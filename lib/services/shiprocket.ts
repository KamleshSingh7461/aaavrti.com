
/**
 * Shiprocket API Service
 * Based on provided documentation.
 * 
 * Flow:
 * 1. Login with Email/Password -> Get Token
 * 2. Use Token for subsequent requests (Create Order, Generate AWB)
 */

type ShiprocketCredentials = {
    email: string;
    password: string;
};

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

export class ShiprocketService {
    private token: string | null = null;

    constructor() { }

    /**
     * authenticate
     * Authenticates with Shiprocket to get a Bearer token.
     * NOTE: In a real app, you'd cache this token (e.g., in Redis) to avoid hitting the login limit.
     */
    async authenticate(creds: ShiprocketCredentials) {
        // Return mock token if no real credentials provided (for Demo)
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !creds.email) {
            console.log('Returning Mock Token for Shiprocket');
            this.token = 'mock_jwt_token_12345';
            return this.token;
        }

        try {
            const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            if (!res.ok) throw new Error('Shiprocket Authentication Failed');

            const data = await res.json();
            this.token = data.token;
            return this.token;
        } catch (error) {
            console.error('Shiprocket Auth Error:', error);
            throw error;
        }
    }

    /**
     * createOrder
     * Maps our internal Order object to Shiprocket's expected payload.
     */
    async createOrder(order: any) {
        if (!this.token) throw new Error('Not authenticated');

        const payload = {
            order_id: order.orderNumber, // Use human readable Order Number
            order_date: new Date(order.createdAt).toISOString(),
            pickup_location: 'Primary',
            billing_customer_name: order.shippingAddress?.name?.split(' ')[0] || order.user?.name || 'Customer',
            billing_last_name: order.shippingAddress?.name?.split(' ').slice(1).join(' ') || '',
            billing_address: order.shippingAddress.street,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.postalCode,
            billing_state: order.shippingAddress.state,
            billing_country: 'India',
            billing_email: order.user.email,
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: order.items.map((item: any) => ({
                name: item.product?.name_en || item.name || 'Product',
                sku: item.product?.sku || item.sku || `SKU-${item.productId}`,
                units: item.quantity,
                selling_price: item.price,
                discount: item.discount || 0,
            })),
            payment_method: order.paymentProtocol === 'COD' ? 'COD' : 'Prepaid',
            sub_total: order.subtotal,
            length: 10, breadth: 10, height: 10, weight: 0.5 // Defaults
        };

        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            return {
                order_id: 123456,
                shipment_id: 789012,
                status: 'NEW',
                awb_code: 'SR_MOCK_AWB_123'
            };
        }

        const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(payload)
        });

        return res.json();
    }

    /**
     * checkServiceability
     * Checks if a pincode is serviceable.
     */
    async checkServiceability(pincode: string) {
        if (!this.token) await this.authenticate({ email: process.env.SHIPROCKET_EMAIL || '', password: process.env.SHIPROCKET_PASSWORD || '' });

        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            return { status: 200, data: { courier_companies: [{ courier_name: 'Blue Dart' }] } };
        }

        const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pincode}&cod=1&weight=0.5`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });

        return res.json();
    }

    /**
     * generateAWB
     * Assigns a courier and generates AWB.
     */
    async generateAWB(shipmentId: string) {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            return { awb_assign_status: 1, response: { data: { awb_code: 'AWB123456789' } } };
        }

        const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ shipment_id: shipmentId })
        });

        return res.json();
    }
}

export const shiprocket = new ShiprocketService();
