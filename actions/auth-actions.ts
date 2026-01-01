
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
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
        const email = formData.get('email') as string;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return 'Invalid credentials.';
        }

        if (user.role !== 'ADMIN') {
            return 'Access denied. Admin credentials required.';
        }

        // The redirectPath should ideally be passed as an argument or derived from context
        // For now, assuming a direct redirect to /admin/dashboard as per instruction.
        // If `redirectPath` was intended to be a parameter, the function signature would need modification.
        const redirectPath = formData.get('redirectTo') as string | null; // Example of how redirectPath might be obtained

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
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return 'User already exists.';
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Cannot sign in directly here in server action usually without redirect loop issues or 'use server' complexity with cookies sometimes.
        // Easier to just return success and let client redirect to login, or attempt signIn if robust.
        // Let's keep it simple: Return success message.
        return 'success';

    } catch (error) {
        console.error('Registration Error:', error);
        return 'Database Error: Failed to Register.';
    }
}
