import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register"];
const TOKEN_NAME = "doctor-tracker-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  // 1. Allow public auth API routes unconditionally
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Allow auth pages (/login, /register) unconditionally
  // Never redirect away from login/register, preventing any redirect loops
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // 3. For protected API routes: if no token, return 401
  if (pathname.startsWith("/api/")) {
    if (!token) {
      // Session discovery is part of every public page load. An empty session
      // is a normal state, so return no content instead of a noisy 401.
      if (pathname === "/api/auth/me") {
        return new NextResponse(null, {
          status: 204,
          headers: { "Cache-Control": "no-store" },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 4. For protected dashboard pages: if no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
