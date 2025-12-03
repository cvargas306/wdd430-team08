import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller, getUserFromRequest } from "@/lib/error-handler";
import { validateData, updateProductSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getProductWithReviews(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: unwrap params
    const { id: productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch product
    const productResult = await sql`
      SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.stock,
        s.seller_id,
        s.name AS seller_name,
        c.name AS category
      FROM products p
      JOIN sellers s ON p.seller_id = s.seller_id
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${productId}
      LIMIT 1
    `;

    if (productResult.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productResult[0];

    // 2️⃣ Fetch reviews
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

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json(
      {
        product: {
          ...product,
          price: Number(product.price),
          images: product.images || [],
          rating: Number(avgRating.toFixed(2)),
          total_reviews: reviews.length,
        },
        reviews,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


async function updateProduct(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = requireSeller(req);
  if (!user) {
    return NextResponse.json({ error: "Seller access required" }, { status: 403 });
  }
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateData(updateProductSchema, body);
  if (!validation.success) {
    throw validation.errors;
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

  // Check if product exists and belongs to the seller
  const existingProduct = await sql`
    SELECT seller_id FROM products WHERE id = ${id}
  `;

  if (existingProduct.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (existingProduct[0].seller_id !== user.seller_id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const product = await sql`
    UPDATE products
    SET ${updateSet}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, name, description, price, category_id, images, stock, updated_at
  `;

  return NextResponse.json(product[0], { status: 200 });
}

async function deleteProduct(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = requireSeller(req);
  if (!user) {
    return NextResponse.json({ error: "Seller access required" }, { status: 403 });
  }

  // Check if product exists and belongs to the seller
  const existingProduct = await sql`
    SELECT seller_id FROM products WHERE id = ${id}
  `;

  if (existingProduct.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (existingProduct[0].seller_id !== user.seller_id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await sql`DELETE FROM products WHERE id = ${id}`;

  return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
}

export const GET = (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => getProductWithReviews(req, context);
export const PUT = withErrorHandler(updateProduct);
export const DELETE = withErrorHandler(deleteProduct);