import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api/");
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/about',
    '/contact',
    '/shop',
    '/sellers',
    '/products',
  ];

  // Public API routes
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh',
    '/api/products',
    '/api/sellers',
    '/api/categories'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Protected routes
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // ❌ If it's an API request → return JSON
    if (isApiRoute) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // ✔ If it's a page → redirect
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    // ❌ API → JSON only
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // ✔ Page → redirect
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based checks
  if (pathname.startsWith('/seller/') && !payload.is_seller) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Inject user data into headers for API routes
  const response = NextResponse.next();
  
  if (isApiRoute) {
    response.headers.set("x-user-id", payload.user_id);
    response.headers.set("x-user-email", payload.email);
    response.headers.set("x-user-role", payload.is_seller ? "seller" : "buyer");
    if (payload.seller_id) {
      response.headers.set("x-seller-id", payload.seller_id);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
