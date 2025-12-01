import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }

      // Handle database errors
      if (error.code) {
        // PostgreSQL error codes
        switch (error.code) {
          case '23505': // unique_violation
            return NextResponse.json(
              { error: 'Resource already exists' },
              { status: 409 }
            );
          case '23503': // foreign_key_violation
            return NextResponse.json(
              { error: 'Referenced resource does not exist' },
              { status: 400 }
            );
          case '23502': // not_null_violation
            return NextResponse.json(
              { error: 'Required field is missing' },
              { status: 400 }
            );
          default:
            break;
        }
      }

      // Handle known error types
      if (error.message?.includes('JWT')) {
        return NextResponse.json(
          { error: 'Authentication error' },
          { status: 401 }
        );
      }

      if (error.message?.includes('permission') || error.message?.includes('access')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Generic server error
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to get user from request headers (set by middleware)
export function getUserFromRequest(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');
  const userRole = req.headers.get('x-user-role');
  const sellerId = req.headers.get('x-seller-id');

  if (!userId || !userEmail) {
    return null;
  }

  return {
    user_id: userId,
    email: userEmail,
    role: userRole,
    seller_id: sellerId || undefined,
  };
}

// Helper function to check if user is seller
export function requireSeller(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'seller') {
    throw new Error('Seller access required');
  }
  return user;
}

// Helper function to check if user is buyer
export function requireBuyer(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role === 'seller') {
    throw new Error('Buyer access required');
  }
  return user;
}