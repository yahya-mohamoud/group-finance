import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySignedToken } from "@/lib/auth/session";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/people",
  "/payments",
  "/expenses",
  "/reports",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const rawToken = await verifySignedToken(sessionCookie);
  const isAuthenticated = Boolean(rawToken);

  // 1. If user is trying to access /login:
  if (pathname === "/login") {
    if (isAuthenticated) {
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Root path: redirect to dashboard if authenticated, else login
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Check if path is protected
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!isAuthenticated) {
      // Unauthenticated access to protected route: redirect to /login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated: forward request with cache control headers to prevent back-button cache leaks
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
