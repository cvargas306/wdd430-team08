import postgres from "postgres";

export const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

export async function updateProductRating(productId: string) {
  const result = await sql`
    SELECT 
      COALESCE(AVG(rating), 0) AS avg_rating,
      COUNT(*) AS total_reviews
    FROM product_reviews
    WHERE product_id = ${productId}
  `;

  const avg = Number(result[0].avg_rating);
  const count = Number(result[0].total_reviews);

  return { avg, count };
}