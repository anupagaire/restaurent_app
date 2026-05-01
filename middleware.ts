import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const isProtectedRoute = 
    pathname.startsWith("/super-admin") || 
    pathname.startsWith("/restaurant-admin");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check token from cookies (main priority)
  let token = request.cookies.get("access_token")?.value;

  // Fallback: Check Authorization header (in case token is sent via header)
  if (!token) {
    token = request.headers.get("authorization")?.replace("Bearer ", "");
  }


  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // optional: remember where user was
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/restaurant-admin/:path*",
  ],
};