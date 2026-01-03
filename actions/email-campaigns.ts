'use server';

import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';
import { Order } from '@/lib/models/Order';
import { sendEmail } from '@/lib/email-service';
import {
    welcomeTemplate,
    orderConfirmationTemplate
} from '@/lib/email-templates';

/**
 * Email Campaign Types
 */
type CampaignType = 'WELCOME' | 'POST_PURCHASE' | 'WIN_BACK' | 'BIRTHDAY';

/**
 * Track email campaign status for each user
 */
interface EmailCampaignStatus {
    welcomeSeries: number; // 0, 1, 2, 3 (which email sent)
    postPurchase: number;
    winBack: boolean;
    lastEmailSent: Date;
}

/**
 * Send Welcome Email Series (3 emails)
 * Day 0: Welcome + 10% coupon
 * Day 3: Explore collections
 * Day 7: Complete first purchase (if no order)
 */
export async function sendWelcomeSeries() {
    try {
        await dbConnect();

        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Email 1: Immediate welcome (Day 0)
        const newUsers = await User.find({
            createdAt: { $gte: new Date(now.getTime() - 1 * 60 * 60 * 1000) }, // Last hour
            'emailCampaignStatus.welcomeSeries': { $lt: 1 }
        }).limit(50);

        for (const user of newUsers) {
            await sendEmail({
                to: user.email,
                subject: 'Welcome to Aaavrti - 10% Off Your First Order! 🎉',
                html: welcomeTemplate(user.name || 'Friend'),
                category: 'WELCOME'
            });

            await User.findByIdAndUpdate(user._id, {
                'emailCampaignStatus.welcomeSeries': 1,
                'emailCampaignStatus.lastEmailSent': now
            });
        }

        // Email 2: Day 3 - Explore collections
        const day3Users = await User.find({
            createdAt: { $lte: threeDaysAgo, $gte: new Date(threeDaysAgo.getTime() - 1 * 60 * 60 * 1000) },
            'emailCampaignStatus.welcomeSeries': 1
        }).limit(50);

        for (const user of day3Users) {
            await sendEmail({
                to: user.email,
                subject: 'Discover Our Handcrafted Collections 🌟',
                html: exploreCollectionsTemplate(user.name),
                category: 'WELCOME'
            });

            await User.findByIdAndUpdate(user._id, {
                'emailCampaignStatus.welcomeSeries': 2,
                'emailCampaignStatus.lastEmailSent': now
            });
        }

        // Email 3: Day 7 - First purchase nudge (if no order)
        const day7Users = await User.find({
            createdAt: { $lte: sevenDaysAgo, $gte: new Date(sevenDaysAgo.getTime() - 1 * 60 * 60 * 1000) },
            'emailCampaignStatus.welcomeSeries': 2
        }).limit(50);

        for (const user of day7Users) {
            // Check if user has any orders
            const hasOrder = await Order.exists({ userId: user._id });

            if (!hasOrder) {
                await sendEmail({
                    to: user.email,
                    subject: 'Your 10% Discount is Waiting! ⏰',
                    html: firstPurchaseNudgeTemplate(user.name),
                    category: 'WELCOME'
                });
            }

            await User.findByIdAndUpdate(user._id, {
                'emailCampaignStatus.welcomeSeries': 3,
                'emailCampaignStatus.lastEmailSent': now
            });
        }

        return { success: true, processed: newUsers.length + day3Users.length + day7Users.length };
    } catch (error) {
        console.error('Welcome series error:', error);
        return { success: false, error: 'Failed to send welcome series' };
    }
}

/**
 * Send Post-Purchase Email Series (3 emails)
 * Day 1: Thank you + care instructions
 * Day 7: Request review
 * Day 30: Product recommendations
 */
export async function sendPostPurchaseFlow() {
    try {
        await dbConnect();

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Email 1: Day 1 after delivery - Thank you
        const recentDeliveries = await Order.find({
            status: 'DELIVERED',
            updatedAt: { $gte: oneDayAgo, $lte: new Date(oneDayAgo.getTime() + 1 * 60 * 60 * 1000) },
            'emailCampaignStatus.postPurchase': { $lt: 1 }
        }).populate('userId').limit(50);

        for (const order of recentDeliveries) {
            const user = order.userId as any;
            if (!user) continue;

            await sendEmail({
                to: user.email,
                subject: 'Thank You for Your Order! 💝',
                html: thankYouTemplate(user.name, order),
                category: 'ORDER'
            });

            await Order.findByIdAndUpdate(order._id, {
                'emailCampaignStatus.postPurchase': 1
            });
        }

        // Email 2: Day 7 - Review request
        const sevenDayOrders = await Order.find({
            status: 'DELIVERED',
            updatedAt: { $lte: sevenDaysAgo, $gte: new Date(sevenDaysAgo.getTime() - 1 * 60 * 60 * 1000) },
            'emailCampaignStatus.postPurchase': 1
        }).populate('userId').populate('items.productId').limit(50);

        for (const order of sevenDayOrders) {
            const user = order.userId as any;
            if (!user) continue;

            await sendEmail({
                to: user.email,
                subject: 'How\'s Your Purchase? Share Your Thoughts! ⭐',
                html: reviewRequestTemplate(user.name, order),
                category: 'ORDER'
            });

            await Order.findByIdAndUpdate(order._id, {
                'emailCampaignStatus.postPurchase': 2
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Post-purchase flow error:', error);
        return { success: false };
    }
}

/**
 * Send Win-Back Campaign (for inactive users)
 * Users who haven't ordered in 60+ days
 */
export async function sendWinBackCampaign() {
    try {
        await dbConnect();

        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

        // Find users with last order > 60 days ago
        const inactiveUsers = await User.find({
            'emailCampaignStatus.winBack': { $ne: true },
            createdAt: { $lte: sixtyDaysAgo }
        }).limit(100);

        let sent = 0;

        for (const user of inactiveUsers) {
            // Check last order date
            const lastOrder = await Order.findOne({ userId: user._id })
                .sort({ createdAt: -1 })
                .lean();

            if (!lastOrder || new Date(lastOrder.createdAt) < sixtyDaysAgo) {
                await sendEmail({
                    to: user.email,
                    subject: 'We Miss You! Here\'s 15% Off 💌',
                    html: winBackTemplate(user.name),
                    category: 'MARKETING'
                });

                await User.findByIdAndUpdate(user._id, {
                    'emailCampaignStatus.winBack': true,
                    'emailCampaignStatus.lastEmailSent': new Date()
                });

                sent++;
            }
        }

        return { success: true, sent };
    } catch (error) {
        console.error('Win-back campaign error:', error);
        return { success: false };
    }
}

/**
 * Email Templates
 */

function exploreCollectionsTemplate(name?: string) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Discover Our Collections</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We're excited to show you our handcrafted heritage wear collections:</p>
            
            <div style="margin: 30px 0;">
                <a href="https://aaavrti.shop/category/sarees" style="display: block; margin: 10px 0; padding: 15px; background: #f5f5f5; text-decoration: none; color: #333; border-left: 4px solid #d4af37;">
                    <strong>Sarees</strong> - Timeless elegance
                </a>
                <a href="https://aaavrti.shop/category/kurtas" style="display: block; margin: 10px 0; padding: 15px; background: #f5f5f5; text-decoration: none; color: #333; border-left: 4px solid #d4af37;">
                    <strong>Kurtas</strong> - Contemporary comfort
                </a>
                <a href="https://aaavrti.shop/category/lehengas" style="display: block; margin: 10px 0; padding: 15px; background: #f5f5f5; text-decoration: none; color: #333; border-left: 4px solid #d4af37;">
                    <strong>Lehengas</strong> - Festive grandeur
                </a>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <a href="https://aaavrti.shop/products" style="display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">
                    Explore All Collections
                </a>
            </p>
        </div>
    `;
}

function firstPurchaseNudgeTemplate(name?: string) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Your 10% Discount Expires Soon! ⏰</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We noticed you haven't made your first purchase yet. Your exclusive welcome discount is still waiting!</p>
            
            <div style="background: linear-gradient(135deg, #d4af37 0%, #c99a2e 100%); padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <div style="color: #fff; font-size: 36px; font-weight: bold; margin-bottom: 10px;">10% OFF</div>
                <div style="color: #fff; font-size: 18px; margin-bottom: 15px;">Use code: <strong>WELCOME10</strong></div>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Valid on orders above ₹2,000</p>
            </div>
            
            <p style="text-align: center;">
                <a href="https://aaavrti.shop/new/arrival" style="display: inline-block; padding: 14px 40px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px;">
                    Shop New Arrivals
                </a>
            </p>
        </div>
    `;
}

function thankYouTemplate(name?: string, order?: any) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Thank You for Your Order! 💝</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We hope you're loving your purchase! Here are some care tips to keep your garment looking beautiful:</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Care Instructions</h3>
                <ul style="line-height: 1.8;">
                    <li>Dry clean recommended for best results</li>
                    <li>Hand wash in cold water if needed</li>
                    <li>Avoid direct sunlight when drying</li>
                    <li>Iron on low heat with a cloth barrier</li>
                </ul>
            </div>
            
            <p>Need help? Our support team is here for you!</p>
            <p style="text-align: center; margin-top: 30px;">
                <a href="https://aaavrti.shop/contact" style="color: #007185; text-decoration: none;">Contact Support</a>
            </p>
        </div>
    `;
}

function reviewRequestTemplate(name?: string, order?: any) {
    const product = order?.items?.[0]?.productId;
    const productLink = product ? `https://aaavrti.shop/product/${product._id || product.id}` : 'https://aaavrti.shop';

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">How's Your Purchase? ⭐</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We'd love to hear about your experience! Your feedback helps us serve you better and helps other customers make informed decisions.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; margin-bottom: 20px;">Rate your purchase:</p>
                <div style="font-size: 32px; margin-bottom: 20px;">⭐⭐⭐⭐⭐</div>
                <a href="${productLink}" style="display: inline-block; padding: 14px 40px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px;">
                    Write a Review
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                As a thank you, you'll be entered into our monthly giveaway!
            </p>
        </div>
    `;
}

function winBackTemplate(name?: string) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">We Miss You! 💌</h2>
            <p>Hi ${name || 'there'},</p>
            <p>It's been a while since we've seen you. We've added amazing new pieces to our collection and we'd love to have you back!</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <div style="color: #fff; font-size: 36px; font-weight: bold; margin-bottom: 10px;">15% OFF</div>
                <div style="color: #fff; font-size: 18px; margin-bottom: 15px;">Use code: <strong>COMEBACK15</strong></div>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Valid for 7 days • No minimum purchase</p>
            </div>
            
            <p style="text-align: center;">
                <a href="https://aaavrti.shop/new/arrival" style="display: inline-block; padding: 14px 40px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px;">
                    See What's New
                </a>
            </p>
        </div>
    `;
}
