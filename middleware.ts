import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_enterprise') ||
    pathname.startsWith('/not-found') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];

  console.log('🔍 Middleware Debug:', {
    host,
    hostname,
    MAIN_DOMAIN,
    API_URL,
    pathname
  });

  const isMainDomain =
    hostname === MAIN_DOMAIN ||
    hostname === MAIN_DOMAIN.split(':')[0] ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.endsWith('.vercel.app');

  console.log('🌐 isMainDomain:', isMainDomain);

  if (!isMainDomain) {
    console.log('🚀 Custom domain detected, calling API...');
    
    try {
      const apiUrl = `${API_URL}/api/v1/restaurant/lookup/?host=${encodeURIComponent(hostname)}`;
      console.log('📡 API URL:', apiUrl);
      
      const res = await fetch(apiUrl, { next: { revalidate: 60 } });
      console.log('📡 API Response Status:', res.status);

      if (res.ok) {
        const restaurant = await res.json();
        console.log('✅ Restaurant found:', restaurant.name, 'ID:', restaurant.id);
        
        const url = request.nextUrl.clone();
        url.pathname = pathname === '/' ? '/_enterprise' : `/_enterprise${pathname}`;
        const response = NextResponse.rewrite(url);

        response.headers.set('x-restaurant-id', String(restaurant.id));
        response.headers.set('x-is-enterprise', 'true');
        response.headers.set('x-restaurant-name', restaurant.name ?? '');

        console.log('🔄 Rewriting to:', url.pathname);
        return response;
      } else {
        console.log('❌ API returned non-OK status:', res.status);
        const errorText = await res.text();
        console.log('❌ Error response:', errorText);
      }
    } catch (e) {
      console.error('❌ Domain lookup failed:', e);
    }

    console.log('⚠️ Redirecting to /not-found');
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
    // Unknown role → login
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
    "/((?!_next|_enterprise|favicon\\.ico|api|not-found).*)",
    
  ],
};
