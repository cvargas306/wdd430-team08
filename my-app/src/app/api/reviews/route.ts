import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, getUserFromRequest } from "@/lib/error-handler";
import { validateData, createReviewSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getReviews(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('seller_id');

  let reviews;

  if (sellerId) {
    // Get reviews for a specific seller
    reviews = await sql`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.seller_id = ${sellerId}
      ORDER BY r.created_at DESC
    `;
  } else {
    // Get all reviews (admin functionality)
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    reviews = await sql`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as reviewer_name, s.name as seller_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN sellers s ON r.seller_id = s.seller_id
      ORDER BY r.created_at DESC
    `;
  }

  return NextResponse.json(reviews, { status: 200 });
}

async function createReview(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const validation = validateData(createReviewSchema, body);
  if (!validation.success) {
    throw validation.errors;
  }

  const { seller_id, rating, comment } = validation.data;

  // Check if seller exists
  const seller = await sql`
    SELECT seller_id FROM sellers WHERE seller_id = ${seller_id}
  `;

  if (seller.length === 0) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  // Check if user already reviewed this seller
  const existingReview = await sql`
    SELECT id FROM reviews WHERE user_id = ${user.user_id} AND seller_id = ${seller_id}
  `;

  if (existingReview.length > 0) {
    return NextResponse.json({ error: "You have already reviewed this seller" }, { status: 400 });
  }

  const review = await sql`
    INSERT INTO reviews (user_id, seller_id, rating, comment)
    VALUES (${user.user_id}, ${seller_id}, ${rating}, ${comment || null})
    RETURNING id, rating, comment, created_at
  `;

  // Update seller's average rating and review count
  await sql`
    UPDATE sellers
    SET rating = (
      SELECT AVG(rating)::decimal(3,2) FROM reviews WHERE seller_id = ${seller_id}
    ),
    reviews = (
      SELECT COUNT(*) FROM reviews WHERE seller_id = ${seller_id}
    )
    WHERE seller_id = ${seller_id}
  `;

  return NextResponse.json(review[0], { status: 201 });
}

export const GET = withErrorHandler(getReviews);
export const POST = withErrorHandler(createReview);