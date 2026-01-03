
'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schema for validation
const SignUpSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

// Admin authentication - validates admin role
export async function authenticateAdmin(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            redirect: false,
        });

        // Verify user is admin
        await dbConnect();
        const email = formData.get('email') as string;
        const user = await User.findOne({ email });

        if (!user) {
            return 'Invalid credentials.';
        }

        if (user.role !== 'ADMIN') {
            return 'Access denied. Admin credentials required.';
        }

        const redirectPath = formData.get('redirectTo') as string | null;

        if (redirectPath) {
            redirect(redirectPath);
        } else {
            redirect('/admin/dashboard');
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

// Customer authentication
export async function authenticateCustomer(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        await dbConnect();
        const user = await User.findOne({ email });

        if (user && !user.emailVerified) {
            return 'Please verify your email first.';
        }

        await signIn('credentials', {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            redirect: false,
        });

        redirect('/account');
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

import { sendVerificationEmail } from '@/lib/email';

export async function registerUser(prevState: string | undefined, formData: FormData) {
    const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return 'Missing Fields. Failed to Register.';
    }

    const { email, password, name } = validatedFields.data;

    try {
        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.emailVerified) {
                return 'User already exists.';
            } else {
                // User exists but not verified, resend OTP logic could be here, but for now just error or overwrite?
                // Let's allow overwrite if not verified for simplicity or handle as "Account exists but not verified"
                // For security, standard practice is "User already exists", but for UX:
                // We will update the existing unverified user with new details (or just new OTP)
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (existingUser && !existingUser.emailVerified) {
            existingUser.password = hashedPassword;
            existingUser.name = name;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            await existingUser.save();
        } else if (!existingUser) {
            await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry
            });
        } else {
            return 'User already exists.';
        }

        // Send Email
        const emailResult = await sendVerificationEmail(email, otp);

        if (!emailResult.success) {
            return emailResult.error || 'Failed to send verification email.';
        }

        return `verify|${email}`;

    } catch (error) {
        console.error('Registration Error:', error);
        return 'Database Error: Failed to Register.';
    }
}

export async function verifyOtp(email: string, otp: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        if (user.emailVerified) {
            return { success: true, message: 'Already verified.' };
        }

        if (user.otp !== otp) {
            return { success: false, message: 'Invalid OTP.' };
        }

        if (new Date() > user.otpExpiry) {
            return { success: false, message: 'OTP Expired.' };
        }

        user.emailVerified = new Date();
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return { success: true };
    } catch (error) {
        console.error('Verification Error:', error);
        return { success: false, message: 'Verification failed.' };
    }
}

export async function resendOtp(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) return { success: false, message: 'User not found.' };
        if (user.emailVerified) return { success: false, message: 'Already verified.' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendVerificationEmail(email, otp);

        return { success: true, message: 'OTP resent.' };

    } catch (error) {
        return { success: false, message: 'Failed to resend OTP.' };
    }
}

export async function handleSignOut() {
    await signOut({ redirectTo: "/" });
}
