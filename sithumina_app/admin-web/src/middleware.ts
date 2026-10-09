import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";

/**
 * PRODUCTION NOTE:
 * Real authentication must replace this cookie check.
 * Verify JWT signature or validate session against database/session store here.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Exclude static assets, api routes, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // If on login page and already logged in, redirect to dashboard
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated user trying to access admin pages -> redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
