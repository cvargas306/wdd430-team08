import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/about',
    '/contact',
    '/shop',
    '/sellers',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh',
    '/api/products',
    '/api/sellers',
  ];

  // Buyer routes that require authentication but not seller role
  const buyerRoutes = ['/profile'];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is a buyer route
  const isBuyerRoute = buyerRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // No access token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the access token
  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/seller/') && !payload.is_seller) {
    // Only sellers can access seller routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isBuyerRoute && payload.is_seller) {
    // Sellers cannot access buyer routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For API routes that require seller role
  if (pathname.startsWith('/api/sellers/') && request.method !== 'GET') {
    if (!payload.is_seller) {
      return NextResponse.json({ error: 'Seller access required' }, { status: 403 });
    }
  }

  // Add user info to headers for API routes
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.user_id);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-role', payload.is_seller ? 'seller' : 'buyer');
  if (payload.seller_id) {
    response.headers.set('x-seller-id', payload.seller_id);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};