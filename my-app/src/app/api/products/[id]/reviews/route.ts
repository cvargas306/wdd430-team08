import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { getUserFromToken } from "@/lib/auth-server";
import { updateProductRating } from "@/lib/reviews";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

// GET — Fetch reviews
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;

    const reviews = await sql`
      SELECT 
        r.review_id,
        r.rating,
        r.comment,
        r.created_at,
        u.user_id,
        u.name AS user_name
      FROM product_reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ${productId}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json(reviews, { status: 200 });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST — Create review
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: "Rating must be between 1–5" }, { status: 400 });

    await sql`
      INSERT INTO product_reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${user.user_id}, ${rating}, ${comment || null})
    `;

    const updated = await updateProductRating(productId);

    return NextResponse.json(
      {
        message: "Review submitted",
        updated_rating: updated.avg,
        total_reviews: updated.count
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Error creating review:", err);

    if (err.message?.includes("unique_user_product_review")) {
      return NextResponse.json(
        { error: "You already reviewed this product" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

