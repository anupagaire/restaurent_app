import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/restaurant-admin");

  if (!isProtectedRoute) return NextResponse.next();

  // Check token
  let token = request.cookies.get("access_token")?.value;
  if (!token) {
    token = request.headers.get("authorization")?.replace("Bearer ", "");
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Role-based guard
  const role = request.cookies.get("role")?.value?.toLowerCase();

  if (pathname.startsWith("/super-admin") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/restaurant-admin", request.url));
  }

  if (pathname.startsWith("/restaurant-admin") && role === "super_admin") {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/super-admin/:path*", "/restaurant-admin/:path*"],
};