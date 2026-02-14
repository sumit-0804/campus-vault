import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    // 1. If user is authenticated and on the Landing Page ('/'), redirect to Dashboard
    if (isAuthenticated && req.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // --- Ban Enforcement ---
    if (token?.isBanished) {
        // If banished, only allow access to /banished and auth routes/api
        if (!req.nextUrl.pathname.startsWith("/banished") &&
            !req.nextUrl.pathname.startsWith("/api/auth")) {
            return NextResponse.redirect(new URL("/banished", req.url));
        }
        return NextResponse.next();
    } else {
        // If NOT banished, but trying to access /banished, redirect to dashboard
        if (req.nextUrl.pathname.startsWith("/banished")) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }
    // -----------------------

    // 2. Define protected routes base paths
    const protectedRoutes = ["/dashboard", "/marketplace/create", "/lost-found/report", "/admin"];

    // Check if the current path starts with any of the protected routes
    const isProtectedRoute = protectedRoutes.some((path) =>
        req.nextUrl.pathname.startsWith(path)
    );

    // 3. If user is NOT authenticated and tries to access a protected route, redirect to Sign In
    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
