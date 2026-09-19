import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./lib/auth/session";

// Routes strictly restricted to General Directorate Headquarters (Director General & HQ staff)
const HEADQUARTER_ONLY_PREFIXES = [
  "/admin/audit-logs",
  "/admin/cross-municipality",
  "/reports/regional",
  "/directorate-general",
];

// Protected route prefixes that require Gov ERP authentication
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/gis-parcels",
  "/finance",
  "/edms",
  "/violations",
  "/projects",
  "/settings",
  "/admin",
  "/reports",
  "/directorate-general",
  "/track",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next.js assets, and public APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.includes(".") // static files like favicon.ico, images
  ) {
    return NextResponse.next();
  }

  // 2. Check if the route requires Gov ERP authentication
  const isProtected = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // 3. Extract and verify session token from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 4. If route is protected and user is not authenticated -> redirect to /login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect to /dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. If user is logged in, perform headquarter authorization check and inject context headers
  if (user) {
    // Headquarter & Cross-Municipality Route Enforcement:
    const isHqOnlyRoute = HEADQUARTER_ONLY_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isHqOnlyRoute && !user.isHeadquarter) {
      // Redirect unauthorized municipal staff back to their local dashboard with error param
      const deniedUrl = new URL("/dashboard/parcels", request.url);
      deniedUrl.searchParams.set("unauthorized_hq", "true");
      return NextResponse.redirect(deniedUrl);
    }

    // Inject authenticated user context headers for downstream server components and API handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.userId);
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-municipality-id", user.municipalityId);
    requestHeaders.set("x-is-headquarter", user.isHeadquarter ? "true" : "false");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 6. Completely public routes (e.g. "/", "/login", "/track", "/api/track", etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

