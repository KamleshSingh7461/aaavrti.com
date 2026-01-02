'use server';

import dbConnect from '@/lib/db';
import { NewsletterSubscriber } from '@/lib/models/Marketing';
import { revalidatePath } from 'next/cache';

/**
 * Public action: Subscribe a new email or reactivate an existing one.
 */
export async function subscribeNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return { error: 'Invalid email address' };
    }

    try {
        await dbConnect();
        const existing = await NewsletterSubscriber.findOne({ email });

        if (existing) {
            if (existing.isActive) {
                return { success: true, message: 'You are already subscribed!' };
            } else {
                existing.isActive = true;
                await existing.save();
                return { success: true, message: 'Welcome back! Your subscription is active again.' };
            }
        }

        await NewsletterSubscriber.create({ email });

        revalidatePath('/admin/marketing/newsletter');
        return { success: true, message: 'Thank you for subscribing!' };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { error: 'Failed to subscribe. Please try again later.' };
    }
}

/**
 * Admin action: Get all newsletter subscribers with basic filtering.
 */
export async function getSubscribers(filters?: { search?: string; status?: 'active' | 'inactive' | 'all' }) {
    try {
        await dbConnect();
        const query: any = {};

        if (filters?.search) {
            query.email = { $regex: filters.search, $options: 'i' };
        }

        if (filters?.status && filters.status !== 'all') {
            query.isActive = filters.status === 'active';
        }

        const subscribers = await NewsletterSubscriber.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return subscribers.map((s: any) => ({
            ...s,
            id: s._id.toString()
        }));
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }
}

/**
 * Admin action: Toggle subscriber activity.
 */
export async function toggleSubscriberStatus(id: string) {
    try {
        await dbConnect();
        const sub = await NewsletterSubscriber.findById(id);
        if (!sub) return { error: 'Subscriber not found' };

        sub.isActive = !sub.isActive;
        await sub.save();

        revalidatePath('/admin/marketing/newsletter');
        return { success: true };
    } catch (error) {
        console.error('Error toggling subscriber status:', error);
        return { error: 'Failed to update status' };
    }
}

/**
 * Admin action: Delete a subscriber.
 */
export async function deleteSubscriber(id: string) {
    try {
        await dbConnect();
        await NewsletterSubscriber.findByIdAndDelete(id);
        revalidatePath('/admin/marketing/newsletter');
        return { success: true };
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return { error: 'Failed to delete subscriber' };
    }
}
/**
 * Public action: Unsubscribe an email.
 */
export async function unsubscribeNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return { error: 'Invalid email address' };
    }

    try {
        await dbConnect();
        await NewsletterSubscriber.findOneAndUpdate(
            { email },
            { isActive: false }
        );

        revalidatePath('/admin/marketing/newsletter');
        return { success: true, message: 'You have been unsubscribed successfully.' };
    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        return { error: 'Failed to unsubscribe. Please try again later.' };
    }
}

/**
 * Admin action: Send a newsletter to all active subscribers.
 */
export async function sendNewsletter(subject: string, htmlContent: string) {
    try {
        // Dynamic import to avoid issues during build if resend not configured
        const { resend } = await import('@/lib/resend');
        if (!resend) return { error: 'Resend not configured' };

        await dbConnect();
        const subscribers = await NewsletterSubscriber.find({ isActive: true }).select('email');

        if (subscribers.length === 0) {
            return { error: 'No active subscribers found.' };
        }

        const emails = subscribers.map((sub: any) => sub.email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aaavrti.com';

        // Resend limited to 50 emails in one call for the free tier/some plans
        // We'll send sequentially or batch if needed.
        // For now, let's try sending to list if Resend supports broadcasting, or iterate.
        // Sending individually for simplicity in this migration snippet.

        await Promise.all(
            emails.map((email: string) => {
                const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

                return resend.emails.send({
                    from: 'Aaavrti <newsletter@aaavrti.com>',
                    to: email,
                    subject: subject,
                    html: `
                        <div style="font-family: serif; line-height: 1.6; color: #333;">
                            ${htmlContent}
                            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;" />
                            <div style="font-size: 12px; color: #999; text-align: center;">
                                <p>© ${new Date().getFullYear()} Aaavrti. All rights reserved.</p>
                                <p>You are receiving this because you subscribed to our newsletter.</p>
                                <p><a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a> from this list.</p>
                            </div>
                        </div>
                    `,
                    headers: {
                        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@aaavrti.com?subject=unsubscribe>`,
                        'List-Id': 'Aaavrti Newsletter <newsletter.aaavrti.com>',
                        'X-Entity-Ref-ID': `newsletter-${Date.now()}`
                    }
                });
            })
        );

        return { success: true, count: emails.length };
    } catch (error) {
        console.error('Error sending newsletter:', error);
        return { error: 'Failed to send newsletter' };
    }
}
