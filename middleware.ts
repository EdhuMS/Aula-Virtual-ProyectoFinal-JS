import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protección basada en roles
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        if (path.startsWith("/teacher") && token?.role !== "TEACHER") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        if (path.startsWith("/student") && token?.role !== "STUDENT") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
