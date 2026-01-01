
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
            order_id: order.id,
            order_date: new Date().toISOString(),
            pickup_location: 'Primary',
            billing_customer_name: order.customer.firstName,
            billing_last_name: order.customer.lastName,
            billing_address: order.address.street,
            billing_city: order.address.city,
            billing_pincode: order.address.zip,
            billing_state: order.address.state,
            billing_country: 'India',
            billing_email: order.customer.email,
            billing_phone: order.customer.phone,
            shipping_is_billing: true,
            order_items: order.items.map((item: any) => ({
                name: item.name,
                sku: item.sku,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: 'Prepaid', // or COD
            sub_total: order.total,
            length: 10, breadth: 10, height: 10, weight: 0.5 // Defaults
        };

        // return mock response for demo
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            return {
                order_id: 123456,
                shipment_id: 789012,
                status: 'NEW',
                awb_code: 'SR_MOCK_AWB_123'
            }
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
