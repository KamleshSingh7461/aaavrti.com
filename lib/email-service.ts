import nodemailer from 'nodemailer';

const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

// Email Categories
export type EmailCategory = 'OTP' | 'WELCOME' | 'ORDER' | 'NEWSLETTER' | 'ALERT';

interface SenderIdentity {
    name: string;
    email: string;
}

// Configurable Sender Identities
// You can define these in your .env file
const getSender = (category: EmailCategory): SenderIdentity => {
    const domain = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'aaavrti.shop';

    // Default fallback addresses (user can override via ENV if needed, or we just generate them)
    // NOTE: If using Gmail SMTP, the 'email' part is often overwritten by Google to the authenticated user.
    // To truly hide your personal email, use AWS SES, SendGrid, or a Domain Email (Zoho/Google Workspace).

    switch (category) {
        case 'OTP':
            return {
                name: process.env.EMAIL_NAME_OTP || 'Aaavrti Security',
                email: process.env.EMAIL_ADDR_OTP || `security@${domain}`
            };
        case 'WELCOME':
            return {
                name: process.env.EMAIL_NAME_WELCOME || 'Aaavrti Community',
                email: process.env.EMAIL_ADDR_WELCOME || `welcome@${domain}`
            };
        case 'ORDER':
            return {
                name: process.env.EMAIL_NAME_ORDER || 'Aaavrti Orders',
                email: process.env.EMAIL_ADDR_ORDER || `orders@${domain}`
            };
        case 'NEWSLETTER':
            return {
                name: process.env.EMAIL_NAME_NEWSLETTER || 'Aaavrti Newsletter',
                email: process.env.EMAIL_ADDR_NEWSLETTER || `newsletter@${domain}`
            };
        case 'ALERT':
        default:
            return {
                name: process.env.EMAIL_NAME_DEFAULT || 'Aaavrti',
                email: process.env.EMAIL_ADDR_DEFAULT || `no-reply@${domain}`
            };
    }
};

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    category?: EmailCategory;
}

export async function sendEmail({ to, subject, html, text, category = 'ALERT' }: SendEmailProps) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not set. Email not sent.');
        if (process.env.NODE_ENV === 'development') {
            console.log('--- EMAIL MOCK ---');
            console.log(`Type: ${category}`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('--- END MOCK ---');
        }
        return { success: false, error: 'SMTP credentials missing' };
    }

    const sender = getSender(category);
    const fromAddress = `"${sender.name}" <${sender.email}>`;

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
            html,
            // Headers for better deliverability/categorization
            headers: {
                'X-Entity-Ref-ID': `${category}-${Date.now()}`,
                'X-Category': category
            }
        });

        console.log(`Message sent (${category}): %s`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}
