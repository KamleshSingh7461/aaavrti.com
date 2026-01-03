

/**
 * Multi-channel notification service with automatic fallback
 * Priority: WhatsApp → SMS → Email (always)
 * 
 * All channels are optional except Email
 */

import { sendEmail } from '@/lib/email-service';

// WhatsApp via Twilio (optional)
let twilioClient: any = null;
const WHATSAPP_ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

if (WHATSAPP_ENABLED) {
    try {
        const twilio = require('twilio');
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    } catch (error) {
        console.warn('Twilio not configured, WhatsApp/SMS disabled');
    }
}

interface NotificationOptions {
    to: {
        email: string;
        phone?: string; // Optional: +91XXXXXXXXXX format
        name?: string;
    };
    subject: string;
    message: string; // Plain text for WhatsApp/SMS
    htmlMessage?: string; // HTML for email
    category?: 'OTP' | 'ORDER' | 'SHIPPING' | 'SUPPORT' | 'MARKETING';
}

interface NotificationResult {
    email: { sent: boolean; error?: string };
    whatsapp?: { sent: boolean; error?: string };
    sms?: { sent: boolean; error?: string };
}

/**
 * Send notification via all available channels with automatic fallback
 */
export async function sendNotification(options: NotificationOptions): Promise<NotificationResult> {
    const result: NotificationResult = {
        email: { sent: false }
    };

    // 1. Try WhatsApp first (if phone provided and enabled)
    if (options.to.phone && WHATSAPP_ENABLED && twilioClient) {
        try {
            await twilioClient.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${options.to.phone}`,
                body: options.message
            });
            result.whatsapp = { sent: true };
            console.log(`✅ WhatsApp sent to ${options.to.phone}`);
        } catch (error: any) {
            result.whatsapp = { sent: false, error: error.message };
            console.warn(`⚠️ WhatsApp failed for ${options.to.phone}:`, error.message);
        }
    }

    // 2. Fallback to SMS if WhatsApp failed (optional)
    if (options.to.phone && !result.whatsapp?.sent && twilioClient) {
        try {
            await twilioClient.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: options.to.phone,
                body: options.message
            });
            result.sms = { sent: true };
            console.log(`✅ SMS sent to ${options.to.phone}`);
        } catch (error: any) {
            result.sms = { sent: false, error: error.message };
            console.warn(`⚠️ SMS failed for ${options.to.phone}:`, error.message);
        }
    }

    // 3. Always send Email (guaranteed delivery)
    try {
        await sendEmail({
            to: options.to.email,
            subject: options.subject,
            html: options.htmlMessage || `<p>${options.message}</p>`,
            category: options.category || 'ORDER'
        });
        result.email = { sent: true };
        console.log(`✅ Email sent to ${options.to.email}`);
    } catch (error: any) {
        result.email = { sent: false, error: error.message };
        console.error(`❌ Email failed for ${options.to.email}:`, error.message);
    }

    return result;
}

/**
 * Send OTP via WhatsApp/SMS with Email fallback
 */
export async function sendOTP(phone: string, email: string, otp: string, name?: string) {
    const message = `Your Aaavrti verification code is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`;

    return sendNotification({
        to: { email, phone, name },
        subject: 'Your Aaavrti Verification Code',
        message,
        htmlMessage: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Verify Your Email</h2>
                <p>Your verification code is:</p>
                <div style="background: #f0f0f0; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes.</p>
            </div>
        `,
        category: 'OTP'
    });
}

/**
 * Send order confirmation via all channels
 */
export async function sendOrderConfirmation(order: any) {
    const message = `🎉 Order Confirmed!\n\nOrder #${order.orderNumber}\nTotal: ₹${order.total.toLocaleString('en-IN')}\n\nTrack: https://aaavrti.shop/track?order=${order.orderNumber}\n\nThank you for shopping with Aaavrti! 🛍️`;

    const user = order.userId || order.user;

    return sendNotification({
        to: {
            email: user.email,
            phone: order.shippingAddress?.phone,
            name: user.name
        },
        subject: `Order Confirmed - #${order.orderNumber}`,
        message,
        category: 'ORDER'
    });
}

/**
 * Send shipping update via all channels
 */
export async function sendShippingUpdate(order: any, trackingId: string) {
    const message = `📦 Your order has been shipped!\n\nOrder #${order.orderNumber}\nTracking ID: ${trackingId}\n\nTrack: https://aaavrti.shop/track?order=${order.orderNumber}`;

    const user = order.userId || order.user;

    return sendNotification({
        to: {
            email: user.email,
            phone: order.shippingAddress?.phone,
            name: user.name
        },
        subject: `Order Shipped - #${order.orderNumber}`,
        message,
        category: 'SHIPPING'
    });
}

/**
 * Send delivery confirmation
 */
export async function sendDeliveryConfirmation(order: any) {
    const message = `✅ Order Delivered!\n\nOrder #${order.orderNumber}\n\nWe hope you love your purchase! Please leave a review.\n\nReview: https://aaavrti.shop/product/${order.items[0]?.productId}`;

    const user = order.userId || order.user;

    return sendNotification({
        to: {
            email: user.email,
            phone: order.shippingAddress?.phone,
            name: user.name
        },
        subject: `Order Delivered - #${order.orderNumber}`,
        message,
        category: 'ORDER'
    });
}

/**
 * Check if WhatsApp is enabled
 */
export function isWhatsAppEnabled(): boolean {
    return WHATSAPP_ENABLED;
}

/**
 * Check if SMS is enabled
 */
export function isSMSEnabled(): boolean {
    return !!(twilioClient && process.env.TWILIO_PHONE_NUMBER);
}
