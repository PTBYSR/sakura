import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Define protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/inbox") ||
    request.nextUrl.pathname.startsWith("/knowledge-base") ||
    request.nextUrl.pathname.startsWith("/ai-agent") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/sops") ||
    request.nextUrl.pathname.startsWith("/integrations") ||
    request.nextUrl.pathname.startsWith("/chatbot") ||
    request.nextUrl.pathname.startsWith("/sales-agent");

  // Allow access to auth routes and API routes
  const isAuthRoute = 
    request.nextUrl.pathname.startsWith("/authentication") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname === "/";

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }

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

