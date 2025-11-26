import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = [
    '/api/products', // POST requests to products
    '/api/sellers', // Potentially protected seller endpoints
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && request.method !== 'GET') {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      // Add seller info to headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-seller-id', decoded.sellerId);
      requestHeaders.set('x-seller-email', decoded.email);
      requestHeaders.set('x-seller-name', decoded.name);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/products/:path*',
    '/api/sellers/:path*',
  ],
};