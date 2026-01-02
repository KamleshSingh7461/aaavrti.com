import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;
    const path = req.nextUrl.pathname;

    // 1. Auth Pages (Login/Register)
    // If already logged in, redirect away
    if (path.startsWith('/auth') || path.startsWith('/admin-portal/login')) {
        if (isLoggedIn) {
            if (userRole === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
            } else {
                return NextResponse.redirect(new URL('/account', req.nextUrl));
            }
        }
        return NextResponse.next();
    }

    // 2. Admin Routes (/admin/*)
    // Protect: Must be Logged In + Must be ADMIN
    if (path.startsWith('/admin')) {
        if (!isLoggedIn) {
            const loginUrl = new URL('/auth/login', req.nextUrl);
            loginUrl.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(loginUrl);
        }

        if (userRole !== 'ADMIN') {
            // Authorized (Logged in) but Forbidden (Wrong Role)
            // Redirect to Home or specialized 403 page
            return NextResponse.redirect(new URL('/', req.nextUrl));
        }
    }

    // 3. Customer Account Routes
    // Protect: Must be Logged In
    if (path.startsWith('/account') || path.startsWith('/checkout')) {
        if (!isLoggedIn) {
            const loginUrl = new URL('/auth/login', req.nextUrl);
            loginUrl.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/admin/:path*',
        '/account/:path*',
        '/checkout/:path*',
        '/auth/:path*',
        '/admin-portal/:path*'
    ]
};
