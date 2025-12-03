import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, getUserFromRequest } from "@/lib/error-handler";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getFavorites(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await sql`
    SELECT p.id as product_id, p.name, p.price, p.description, p.images, p.stock, p.created_at,
           s.seller_id, s.name as seller_name, s.rating as seller_rating, s.reviews as seller_reviews,
           c.name as category
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    JOIN sellers s ON p.seller_id = s.seller_id
    JOIN categories c ON p.category_id = c.id
    WHERE f.user_id = ${user.user_id}
    ORDER BY f.created_at DESC
  `;

  return NextResponse.json(favorites, { status: 200 });
}

async function addFavorite(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id } = await req.json();

  if (!product_id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Check if already favorited
  const existing = await sql`
    SELECT * FROM favorites WHERE user_id = ${user.user_id} AND product_id = ${product_id}
  `;

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already in favorites" }, { status: 400 });
  }

  await sql`
    INSERT INTO favorites (user_id, product_id)
    VALUES (${user.user_id}, ${product_id})
  `;

  return NextResponse.json({ message: "Added to favorites" }, { status: 201 });
}

async function removeFavorite(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id } = await req.json();

  if (!product_id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  await sql`
    DELETE FROM favorites WHERE user_id = ${user.user_id} AND product_id = ${product_id}
  `;

  return NextResponse.json({ message: "Removed from favorites" }, { status: 200 });
}

export const GET = withErrorHandler(getFavorites);
export const POST = withErrorHandler(addFavorite);
export const DELETE = withErrorHandler(removeFavorite);