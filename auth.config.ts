
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/admin-portal/login',
        newUser: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdminPanel =
                nextUrl.pathname.startsWith('/admin/dashboard') ||
                nextUrl.pathname.startsWith('/admin/products') ||
                nextUrl.pathname.startsWith('/admin/orders') ||
                nextUrl.pathname.startsWith('/admin/categories') ||
                nextUrl.pathname.startsWith('/admin/customers') ||
                nextUrl.pathname.startsWith('/admin/analytics') ||
                nextUrl.pathname.startsWith('/admin/settings');

            if (isOnAdminPanel) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
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
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
