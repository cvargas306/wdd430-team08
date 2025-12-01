import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller } from "@/lib/error-handler";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getSellerAnalytics(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = requireSeller(req);

  // Check if seller exists and belongs to the user
  const existingSeller = await sql`
    SELECT seller_id FROM sellers WHERE seller_id = ${id}
  `;

  if (existingSeller.length === 0) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  if (existingSeller[0].seller_id !== user.seller_id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Get total sales and revenue from orders
  const orderStats = await sql`
    SELECT
      COUNT(*) as total_sales,
      COALESCE(SUM(total_price), 0) as total_revenue
    FROM orders
    WHERE seller_id = ${id} AND status = 'completed'
  `;

  // Get review stats
  const reviewStats = await sql`
    SELECT
      COUNT(*) as total_reviews,
      COALESCE(AVG(rating), 0) as average_rating
    FROM reviews
    WHERE seller_id = ${id}
  `;

  const analytics = {
    totalSales: parseInt(orderStats[0].total_sales),
    totalRevenue: parseFloat(orderStats[0].total_revenue),
    totalReviews: parseInt(reviewStats[0].total_reviews),
    averageRating: parseFloat(reviewStats[0].average_rating),
  };

  return NextResponse.json(analytics, { status: 200 });
}

export const GET = withErrorHandler(getSellerAnalytics);