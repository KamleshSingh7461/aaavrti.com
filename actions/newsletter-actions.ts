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

        const { sendEmail } = await import('@/lib/email-service');
        const { welcomeTemplate } = await import('@/lib/email-templates');

        // Send Welcome Email
        await sendEmail({
            to: email,
            subject: 'Welcome to Aaavrti - 10% OFF Inside',
            html: welcomeTemplate('Friend'),
            category: 'WELCOME'
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
        const { sendEmail } = await import('@/lib/email-service');
        const { newsletterTemplate } = await import('@/lib/email-templates');

        await dbConnect();
        const subscribers = await NewsletterSubscriber.find({ isActive: true }).select('email');

        if (subscribers.length === 0) {
            return { error: 'No active subscribers found.' };
        }

        const emails = subscribers.map((sub: any) => sub.email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aaavrti.shop';

        // Custom SMTP sending
        // In production with many subscribers, you should use a queue (like BullMQ or Amazon SQS)
        // For now, we will loop and send. 

        let successCount = 0;

        await Promise.all(
            emails.map(async (email: string) => {
                const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
                const finalHtml = newsletterTemplate(htmlContent, unsubscribeUrl);

                const result = await sendEmail({
                    to: email,
                    subject,
                    html: finalHtml,
                    category: 'NEWSLETTER'
                });

                if (result.success) successCount++;
            })
        );

        return { success: true, count: successCount };
    } catch (error) {
        console.error('Error sending newsletter:', error);
        return { error: 'Failed to send newsletter' };
    }
}
