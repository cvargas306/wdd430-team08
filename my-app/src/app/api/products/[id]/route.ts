import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller, getUserFromRequest } from "@/lib/error-handler";
import { validateData, updateProductSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getProduct(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const products = await sql`
    SELECT p.id as product_id, p.name, p.price, p.description, p.images, p.stock, p.created_at, p.updated_at,
           s.seller_id, s.name as seller_name, s.rating as seller_rating, s.reviews as seller_reviews,
           c.name as category
    FROM products p
    JOIN sellers s ON p.seller_id = s.seller_id
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ${id}
  `;

  if (products.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = {
    ...products[0],
    price: Number(products[0].price)
  };

  return NextResponse.json(product, { status: 200 });
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

export const GET = withErrorHandler(getProduct);
export const PUT = withErrorHandler(updateProduct);
export const DELETE = withErrorHandler(deleteProduct);