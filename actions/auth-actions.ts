
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
            return 'User already exists.';
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return 'success';

    } catch (error) {
        console.error('Registration Error:', error);
        return 'Database Error: Failed to Register.';
    }
}

export async function handleSignOut() {
    await signOut({ redirectTo: "/" });
}
