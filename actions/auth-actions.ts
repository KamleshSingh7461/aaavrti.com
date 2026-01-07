'use server';

import dbConnect from '@/lib/db';
import { Otp } from '@/lib/models/Otp';
import { User } from '@/lib/models/User';
import { sendEmail } from '@/lib/email-service';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(email: string) {
    if (!email) return { error: 'Email is required' };

    try {
        await dbConnect();

        // 1. Check if user exists (for login vs signup distinction if needed, but for now we just send OTP)
        // If we want to block signup for existing users in "register" flow, we can check.
        // But sendOtp is generic.

        // 2. Clear old OTPs
        await Otp.deleteMany({ email });

        // 3. Generate New OTP
        const otp = generateOtp();

        // 4. Save to DB
        await Otp.create({ email, otp });

        // 5. Send Email
        await sendEmail({
            to: email,
            subject: 'Your Login Verification Code - Ournika',
            category: 'OTP',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #000;">Ournika Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        return { success: true };
    } catch (error) {
        console.error('Send OTP Error:', error);
        return { error: 'Failed to send OTP. Please try again.' };
    }
}

export async function verifyOtp(email: string, otp: string) {
    try {
        await dbConnect();
        const record = await Otp.findOne({ email, otp });

        if (!record) {
            return { error: 'Invalid or expired OTP' };
        }

        // OTP is valid
        // We delete it after usage to prevent replay
        await Otp.deleteOne({ _id: record._id });

        return { success: true };
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return { error: 'Verification failed' };
    }
}

export async function registerWithOtp(data: { email: string, name: string, otp: string }) {
    const { email, name, otp } = data;

    try {
        await dbConnect();

        // 1. Verify OTP first
        const verification = await verifyOtp(email, otp);
        if (verification.error) return verification;

        // 2. Check existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return { error: 'User already exists with this email. Please Login.' };
        }

        // 3. Create User
        // Note: Passwordless users don't need a password hash.
        // But if your User model requires it, we might set a dummy one or make it optional.
        // Let's assume schema allows optional or we set a random secure string.
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

        await User.create({
            name,
            email,
            password: dummyPassword,
            role: 'CUSTOMER',
            provider: 'email'
        });

        // 4. Auto Login
        // Note: We can't use signIn directly in server action for redirect sometimes causing issues,
        // but typically we can if we let it handle the flow.
        // However, the client is calling this.
        // We will return success, and client calls signIn with Credentials (OTP flow).
        // Wait, Credentials provider needs to know this IS an OTP login.

        return { success: true };
    } catch (error) {
        console.error('Registration Error:', error);
        return { error: 'Failed to create account.' };
    }
}

export async function handleSignOut() {
    await signOut({ redirectTo: '/' });
}
