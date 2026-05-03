import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require a valid authenticated session
const protectedPaths = ['/dashboard', '/mission', '/auction', '/disaster', '/results', '/leaderboard', '/final', '/projector'];
const adminPaths = ['/admin'];

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'grss_super_secret_change_in_production'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath || isAdminPath) {
    // 1. No token at all → redirect to login
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // 2. Verify JWT signature using jose (Edge Runtime compatible)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // 3. Admin routes: enforce isAdmin in verified payload
      if (isAdminPath && !payload.isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    } catch {
      // Invalid or expired token → clear cookie and redirect
      const url = request.nextUrl.clone();
      url.pathname = '/';
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 4. Prevent logged-in users from seeing the login page
  if (pathname === '/' && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const url = request.nextUrl.clone();
      url.pathname = payload.isAdmin ? '/admin' : '/dashboard';
      return NextResponse.redirect(url);
    } catch {
      // Token is invalid — let them see the login page, clear bad cookie
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes — verified server-side)
     * - _next/static, _next/image (static assets)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
