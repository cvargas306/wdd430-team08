import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler } from "@/lib/error-handler";
import { validateData, createSellerSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getSellers(req: NextRequest) {
  const sellers = await sql`
    SELECT seller_id, user_id, name, slug, category, description, location, rating, reviews, years_active, followers, image, created_at
    FROM sellers
    ORDER BY created_at DESC
  `;
  return NextResponse.json(sellers, { status: 200 });
}

async function createSeller(req: NextRequest) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateData(createSellerSchema, body);
  if (!validation.success) {
    throw validation.errors;
  }

  const { user_id, name, category, description, location } = validation.data;

  // Check if seller with this user_id already exists
  const existingSeller = await sql`
    SELECT seller_id FROM sellers WHERE user_id = ${user_id}
  `;

  if (existingSeller.length > 0) {
    return NextResponse.json({ error: "Seller profile for this user already exists" }, { status: 400 });
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Ensure slug is unique
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const existingSlug = await sql`SELECT seller_id FROM sellers WHERE slug = ${uniqueSlug}`;
    if (existingSlug.length === 0) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const newSeller = await sql`
    INSERT INTO sellers (user_id, name, slug, category, description, location)
    VALUES (${user_id}, ${name}, ${uniqueSlug}, ${category}, ${description}, ${location})
    RETURNING seller_id, user_id, name, slug, category, description, location, rating, reviews, years_active, followers, image, created_at
  `;

  return NextResponse.json(newSeller[0], { status: 201 });
}

export const GET = withErrorHandler(getSellers);
export const POST = withErrorHandler(createSeller);