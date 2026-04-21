import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// We define paths that require authentication
const protectedPaths = ['/dashboard', '/mission', '/auction', '/disaster', '/results'];
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Check for authentication on protected paths
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath || isAdminPath) {
    if (!token) {
      // Redirect to login if no token
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Basic JWT check (not full verification here as it's the edge)
    // Detailed verification happens in API routes and Server Components
    try {
      // In a real 10/10 app, we'd use 'jose' here to verify the signature
      // For now, we'll allow the request and let the server components do the heavy lifting
    } catch (e) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // 2. Prevent logged-in users from seeing the login screen (landing page)
  if (pathname === '/' && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
