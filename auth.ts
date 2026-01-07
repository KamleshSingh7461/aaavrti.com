
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email }).lean();
        // User from mongoose lean() has _id, NextAuth expects id (string) often
        if (user) {
            return { ...user, id: user._id.toString() };
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

// Ensure AUTH_SECRET is defined
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
    console.warn('⚠️ AUTH_SECRET is not defined in environment variables. Using fallback (NOT SECURE FOR PRODUCTION)');
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: authSecret || 'fallback-secret-for-development-only-change-in-production',
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
            }
            return token;
        }
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                // 1. OTP Authentication
                if (credentials.otp && credentials.email) {
                    const { email, otp } = credentials as { email: string, otp: string };

                    // Verify OTP from DB
                    try {
                        await dbConnect();
                        const { Otp } = await import('@/lib/models/Otp');
                        const otpRecord = await Otp.findOne({ email, otp });

                        if (!otpRecord) {
                            console.log('Invalid OTP');
                            return null;
                        }

                        // OTP Valid. Find User.
                        const user = await getUser(email);

                        if (!user) {
                            // If user not found during login, return null. 
                            // Signup flow should create user first then call signIn.
                            console.log('User not found for OTP login');
                            return null;
                        }

                        // Optional: Delete OTP after successful login usage
                        await Otp.deleteOne({ _id: otpRecord._id });

                        return user;
                    } catch (e) {
                        console.error('OTP Auth Error', e);
                        return null;
                    }
                }

                // 2. Password Authentication (Admin / Legacy)
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user: any = await getUser(email);
                    if (!user) return null;

                    // If user has no password (e.g. OAuth/OTP only), and trying password login
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
