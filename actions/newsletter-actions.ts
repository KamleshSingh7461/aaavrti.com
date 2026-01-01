'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Public action: Subscribe a new email or reactivate an existing one.
 */
export async function subscribeNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return { error: 'Invalid email address' };
    }

    try {
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            if (existing.isActive) {
                return { success: true, message: 'You are already subscribed!' };
            } else {
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true }
                });
                return { success: true, message: 'Welcome back! Your subscription is active again.' };
            }
        }

        await prisma.newsletterSubscriber.create({
            data: { email }
        });

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
        const where: any = {};

        if (filters?.search) {
            where.email = { contains: filters.search };
        }

        if (filters?.status && filters.status !== 'all') {
            where.isActive = filters.status === 'active';
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return subscribers;
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
        const sub = await prisma.newsletterSubscriber.findUnique({ where: { id } });
        if (!sub) return { error: 'Subscriber not found' };

        await prisma.newsletterSubscriber.update({
            where: { id },
            data: { isActive: !sub.isActive }
        });

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
        await prisma.newsletterSubscriber.delete({ where: { id } });
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
        await prisma.newsletterSubscriber.update({
            where: { email },
            data: { isActive: false }
        });

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
        const { resend } = await import('@/lib/resend');
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true }
        });

        if (subscribers.length === 0) {
            return { error: 'No active subscribers found.' };
        }

        const emails = subscribers.map((sub: any) => sub.email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aaavrti.com';

        // Resend limited to 50 emails in one call for the free tier/some plans
        // For simplicity, we send one by one or in small batches here.
        const results = await Promise.all(
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
