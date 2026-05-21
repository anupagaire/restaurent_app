import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute    = pathname.startsWith("/super-admin") || pathname.startsWith("/restaurant-admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  if (!isAdminRoute && !isCustomerRoute) return NextResponse.next();

  // ── Check token ────────────────────────────────────────────────────────────
  let token = request.cookies.get("access_token")?.value;
  if (!token) {
    token = request.headers.get("authorization")?.replace("Bearer ", "");
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = request.cookies.get("role")?.value?.toLowerCase();

  // ── Customer route guard ────────────────────────────────────────────────────
  // Only "customer" role can access /customer
  if (isCustomerRoute && role !== "customer") {
    // Admins/staff who somehow hit /customer → send to their dashboard
    if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin", request.url));
    if (role === "admin" || role === "staff") return NextResponse.redirect(new URL("/restaurant-admin", request.url));
    // Unknown role → login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Admin route guards (existing logic) ────────────────────────────────────
  if (isAdminRoute) {
    if (pathname.startsWith("/super-admin") && role !== "super_admin") {
      return NextResponse.redirect(new URL("/restaurant-admin", request.url));
    }
    if (pathname.startsWith("/restaurant-admin") && role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    // Customer trying to access admin → send to customer dashboard
    if (role === "customer") {
      return NextResponse.redirect(new URL("/customer", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/super-admin/:path*", "/restaurant-admin/:path*", "/customer/:path*"],
};