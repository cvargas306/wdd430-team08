import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller } from "@/lib/error-handler";
import { validateData, createProductSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getProducts(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const sellerId = searchParams.get('seller_id');

  let whereConditions = [];

  if (category && category !== 'all') {
    whereConditions.push(sql`c.name = ${category}`);
  }

  if (minPrice) {
    whereConditions.push(sql`p.price >= ${parseFloat(minPrice)}`);
  }

  if (maxPrice) {
    whereConditions.push(sql`p.price <= ${parseFloat(maxPrice)}`);
  }

  if (search) {
    whereConditions.push(sql`(p.name ILIKE ${`%${search}%`} OR p.description ILIKE ${`%${search}%`})`);
  }

  if (sellerId) {
    whereConditions.push(sql`p.seller_id = ${sellerId}`);
  }

  let whereClause = sql``;
  if (whereConditions.length > 0) {
    whereClause = sql`WHERE ${whereConditions[0]}`;
    for (let i = 1; i < whereConditions.length; i++) {
      whereClause = sql`${whereClause} AND ${whereConditions[i]}`;
    }
  }

  let orderBy = sql`p.created_at DESC`;
  if (sort === 'price_low') orderBy = sql`p.price ASC`;
  else if (sort === 'price_high') orderBy = sql`p.price DESC`;
  else if (sort === 'rating') orderBy = sql`s.rating DESC`;

  const products = await sql`
    SELECT p.id as product_id, p.name, p.price, p.description, p.images[1] as image_url, p.stock,
           s.name as seller, s.rating, s.reviews,
           c.name as category
    FROM products p
    JOIN sellers s ON p.seller_id = s.seller_id
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
  `;

  return NextResponse.json(products, { status: 200 });
}

async function createProduct(req: NextRequest) {
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

  const validation = validateData(createProductSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
  }

  const { name, description, price, category_id, images, stock } = validation.data;

  const product = await sql`
    INSERT INTO products (seller_id, name, description, price, category_id, images, stock)
    VALUES (${user.seller_id!}, ${name}, ${description}, ${price}, ${category_id}, ${images || []}, ${stock || 0})
    RETURNING id, name, description, price, category_id, images, stock, created_at
  `;

  return NextResponse.json(product[0], { status: 201 });
}

export const GET = withErrorHandler(getProducts);
export const POST = withErrorHandler(createProduct);
