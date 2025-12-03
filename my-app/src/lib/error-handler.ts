import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error("API Error:", error);

      /* -----------------------------
       * ZOD VALIDATION ERRORS
       * ----------------------------- */
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue: any) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return NextResponse.json(
          { error: "Validation failed", details: errors },
          { status: 400 }
        );
      }

      /* -----------------------------
       * DATABASE ERRORS (PostgreSQL)
       * ----------------------------- */
      if (error.code) {
        switch (error.code) {
          case "23505": // duplicate key
            return NextResponse.json(
              { error: "Resource already exists" },
              { status: 409 }
            );

          case "23503": // foreign key
            return NextResponse.json(
              { error: "Referenced resource does not exist" },
              { status: 400 }
            );

          case "23502": // null value in column
            return NextResponse.json(
              { error: "A required field is missing" },
              { status: 400 }
            );

          default:
            break;
        }
      }

      /* -----------------------------
       * AUTH ERRORS
       * ----------------------------- */
      if (error.message?.includes("JWT")) {
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 401 }
        );
      }

      if (
        error.message?.includes("permission") ||
        error.message?.includes("access")
      ) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      /* -----------------------------
       * UNKNOWN / SERVER ERROR
       * ----------------------------- */
      return NextResponse.json(
        {
          error: "Internal server error",
          details:
            process.env.NODE_ENV === "development"
              ? error?.message ?? "Unknown error"
              : undefined,
        },
        { status: 500 }
      );
    }
  };
}

/* ------------------------------------------------------
 * USER HELPERS
 * ------------------------------------------------------ */

export function getUserFromRequest(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const userRole = req.headers.get("x-user-role");
  const sellerId = req.headers.get("x-seller-id");

  if (!userId || !userEmail) return null;

  // NEVER RETURN undefined → causes "Undefined values not allowed"
  return {
    user_id: userId,
    email: userEmail,
    role: userRole ?? null,
    seller_id: sellerId ?? null,
  };
}

export function requireSeller(req: NextRequest) {
  const user = getUserFromRequest(req);

  if (!user || user.role !== "seller") {
    throw new Error("Seller access required");
  }

  return user;
}

export function requireBuyer(req: NextRequest) {
  const user = getUserFromRequest(req);

  if (!user || user.role === "seller") {
    throw new Error("Buyer access required");
  }

  return user;
}
