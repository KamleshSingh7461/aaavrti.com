'use server';

import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { sendEmail } from '@/lib/email-service';
import { cartRecoveryTemplate } from '@/lib/email-templates-cart-recovery';

/**
 * Find abandoned carts (PENDING orders older than 1 hour, no recovery email sent)
 * and send recovery emails
 */
export async function sendAbandonedCartEmails() {
    try {
        await dbConnect();

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find PENDING orders created more than 1 hour ago
        // that haven't received a recovery email yet
        const abandonedOrders = await Order.find({
            status: 'PENDING',
            createdAt: { $lt: oneHourAgo },
            recoveryEmailSent: { $ne: true }
        })
            .populate('userId', 'name email')
            .populate('items.productId', 'name_en images price')
            .limit(50) // Process in batches
            .lean();

        console.log(`Found ${abandonedOrders.length} abandoned carts`);

        let emailsSent = 0;

        for (const order of abandonedOrders) {
            try {
                const user = order.userId as any;
                if (!user || !user.email) continue;

                // Create restore link
                const restoreLink = `${process.env.NEXT_PUBLIC_APP_URL}/cart/restore/${order._id}`;

                // Send recovery email
                await sendEmail({
                    to: user.email,
                    subject: 'Complete Your Order - Items Still in Your Cart',
                    html: cartRecoveryTemplate(order, restoreLink),
                    category: 'CART_RECOVERY'
                });

                // Mark as sent
                await Order.findByIdAndUpdate(order._id, {
                    recoveryEmailSent: true,
                    recoveryEmailSentAt: new Date()
                });

                emailsSent++;
                console.log(`Sent recovery email to ${user.email} for order ${order.orderNumber}`);
            } catch (error) {
                console.error(`Failed to send recovery email for order ${order._id}:`, error);
            }
        }

        return {
            success: true,
            processed: abandonedOrders.length,
            emailsSent
        };
    } catch (error) {
        console.error('Failed to process abandoned carts:', error);
        return {
            success: false,
            error: 'Failed to process abandoned carts'
        };
    }
}

/**
 * Get abandoned cart statistics for admin dashboard
 */
export async function getAbandonedCartStats() {
    try {
        await dbConnect();

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [last24h, last7days, recovered] = await Promise.all([
            Order.countDocuments({
                status: 'PENDING',
                createdAt: { $gte: oneDayAgo }
            }),
            Order.countDocuments({
                status: 'PENDING',
                createdAt: { $gte: oneWeekAgo }
            }),
            Order.countDocuments({
                status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
                recoveryEmailSent: true
            })
        ]);

        return {
            last24h,
            last7days,
            recovered,
            recoveryRate: last7days > 0 ? ((recovered / last7days) * 100).toFixed(1) : '0'
        };
    } catch (error) {
        console.error('Failed to get abandoned cart stats:', error);
        return {
            last24h: 0,
            last7days: 0,
            recovered: 0,
            recoveryRate: '0'
        };
    }
}
