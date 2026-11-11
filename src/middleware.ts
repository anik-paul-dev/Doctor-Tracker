import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register"];
const AUTH_PAGES = ["/login", "/register"];
const TOKEN_NAME = "doctor-tracker-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  // Allow public API auth routes
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Auth pages: redirect to home if already logged in
  if (AUTH_PAGES.some((path) => pathname.startsWith(path))) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // All other routes: redirect to login if no token
  if (!token) {
    // API routes return 401 instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
