import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller } from "@/lib/error-handler";
import { validateData, updateSellerSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getSeller(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const sellers = await sql`
    SELECT seller_id, user_id, name, slug, category, description, location, rating, reviews, years_active, followers, image, created_at
    FROM sellers
    WHERE seller_id = ${id} OR slug = ${id}
  `;

  if (sellers.length === 0) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  return NextResponse.json(sellers[0], { status: 200 });
}

async function updateSeller(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = requireSeller(req);
  if (!user) {
    return NextResponse.json({ error: "Seller access required" }, { status: 403 });
  }
  const safeUser = user;
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateData(updateSellerSchema, body);
  if (!validation.success) {
    throw validation.errors;
  }

  // Check if seller exists and belongs to the user
  const existingSeller = await sql`
    SELECT seller_id, user_id FROM sellers WHERE seller_id = ${id} OR slug = ${id}
  `;

  if (existingSeller.length === 0) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  if (existingSeller[0].user_id !== user.user_id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const updateData = validation.data;

  const setFields = Object.entries(updateData)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => sql`${sql(key)} = ${value}`);

  if (setFields.length === 0) {
    return NextResponse.json(
      { error: "No fields provided for update" },
      { status: 400 }
    );
  }

  const updateSet = setFields.reduce((acc, field, index) => index === 0 ? field : sql`${acc}, ${field}`);

  const updatedSeller = await sql`
    UPDATE sellers
    SET ${updateSet}
    WHERE seller_id = ${existingSeller[0].seller_id}
    RETURNING seller_id, user_id, name, slug, category, description, location, rating, reviews, years_active, followers, image, created_at
  `;

  return NextResponse.json(updatedSeller[0], { status: 200 });
}

async function deleteSeller(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = requireSeller(req);
  if (!user) {
    return NextResponse.json({ error: "Seller access required" }, { status: 403 });
  }
  const safeUser = user;

  // Check if seller exists and belongs to the user
  const existingSeller = await sql`
    SELECT seller_id, user_id FROM sellers WHERE seller_id = ${id} OR slug = ${id}
  `;

  if (existingSeller.length === 0) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  if (existingSeller[0].user_id !== safeUser.user_id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await sql`DELETE FROM sellers WHERE seller_id = ${existingSeller[0].seller_id}`;

  return NextResponse.json({ message: "Seller deleted successfully" }, { status: 200 });
}

export const GET = withErrorHandler(getSeller);
export const PUT = withErrorHandler(updateSeller);
export const DELETE = withErrorHandler(deleteSeller);