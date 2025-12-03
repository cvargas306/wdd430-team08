import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler } from "@/lib/error-handler";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getCategories(req: NextRequest) {
  const categories = await sql`
    SELECT id, name
    FROM categories
    ORDER BY name ASC
  `;
  return NextResponse.json(categories, { status: 200 });
}

export const GET = withErrorHandler(getCategories);