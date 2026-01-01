
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const session = await auth();
    const path = request.nextUrl.pathname;

    const isLoggedIn = !!session?.user;
    const userRole = (session?.user as any)?.role;

    // 1. Auth Pages (Login/Register)
    // If already logged in, redirect away
    if (path.startsWith('/auth') || path.startsWith('/admin-portal/login')) {
        if (isLoggedIn) {
            if (userRole === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else {
                return NextResponse.redirect(new URL('/account', request.url));
            }
        }
        return NextResponse.next();
    }

    // 2. Admin Routes (/admin/*)
    // Protect: Must be Logged In + Must be ADMIN
    if (path.startsWith('/admin')) {
        if (!isLoggedIn) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(loginUrl);
        }

        if (userRole !== 'ADMIN') {
            // Authorized (Logged in) but Forbidden (Wrong Role)
            // Redirect to Home or specialized 403 page
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 3. Customer Account Routes
    // Protect: Must be Logged In
    if (path.startsWith('/account') || path.startsWith('/checkout')) {
        if (!isLoggedIn) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/account/:path*',
        '/checkout/:path*',
        '/auth/:path*',
        '/admin-portal/:path*'
    ]
};
