import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000';

// export function middleware(request: NextRequest) {
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // ── Custom domain check (enterprise) ──────────────────────────────────────
  const isMainDomain = host === MAIN_DOMAIN || host.includes('localhost');

  if (!isMainDomain) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/restaurant/lookup/?host=${host}`
      );

      if (res.ok) {
        const restaurant = await res.json();
        // Rewrite to enterprise route, pass restaurant id via header
        const url = request.nextUrl.clone();
        url.pathname = `/enterprise${pathname}`;
        const response = NextResponse.rewrite(url);
        response.headers.set('x-restaurant-id', String(restaurant.id));
        response.headers.set('x-is-enterprise', 'true');
        return response;
        }
    } catch (e) {
      console.error('Domain lookup failed:', e);
    }

    // Custom domain but restaurant not found
    return NextResponse.redirect(new URL('/not-found', request.url));
  }



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
  matcher: ["/super-admin/:path*", "/restaurant-admin/:path*", "/customer/:path*",
    "/((?!_next|favicon.ico|api).*)",
  ],
};