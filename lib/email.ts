import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendVerificationEmail(email: string, otp: string) {
    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Email not sent.');
        return { success: false, error: 'Server Error: RESEND_API_KEY is missing. Please check .env and restart server.' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Aaavrti <onboarding@resend.dev>', // Use verified domain if available, else standard resend dev
            to: [email],
            subject: 'Verify your Aaavrti Account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Aaavrti!</h2>
                    <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                        ${otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error: `Resend Error: ${error.message}` };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Exception sending email:', error);
        return { success: false, error: `Exception: ${error.message}` };
    }
}
