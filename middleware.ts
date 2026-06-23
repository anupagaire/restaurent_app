import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/enterprise') ||
    pathname.startsWith('/not-found') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];

  const isMainDomain =
    hostname === MAIN_DOMAIN ||
    hostname === MAIN_DOMAIN.split(':')[0] ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.endsWith('.vercel.app');

  if (!isMainDomain) {    
    try {
      const apiUrl = `${API_URL}/api/v1/restaurant/lookup/?host=${encodeURIComponent(hostname)}`;      
      const res = await fetch(apiUrl, { next: { revalidate: 60 } });

      if (res.ok) {
        const restaurant = await res.json();
        
        const url = request.nextUrl.clone();
        url.pathname = pathname === '/' ? '/enterprise' : `/enterprise${pathname}`;
        const response = NextResponse.rewrite(url);

        response.headers.set('x-restaurant-id', String(restaurant.id));
        response.headers.set('x-is-enterprise', 'true');
        response.headers.set('x-restaurant-name', restaurant.name ?? '');
        return response;
      } else {
        const errorText = await res.text();
      }
    } catch (e) {
    }

    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  const isAdminRoute    = pathname.startsWith("/super-admin") || pathname.startsWith("/restaurant-admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  if (!isAdminRoute && !isCustomerRoute) return NextResponse.next();

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

  if (isCustomerRoute && role !== "customer") {
    if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin", request.url));
    if (role === "admin" || role === "staff") return NextResponse.redirect(new URL("/restaurant-admin", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

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
  matcher: [
    "/super-admin/:path*",
    "/restaurant-admin/:path*",
    "/customer/:path*",
    "/((?!_next|enterprise|favicon\\.ico|api|not-found).*)",
    
  ],
};
