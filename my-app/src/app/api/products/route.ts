import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, requireSeller } from "@/lib/error-handler";
import { validateData, createProductSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getProducts(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const sellerId = searchParams.get("seller_id");

  let whereConditions = [];

  // CATEGORY FILTER
  if (category && category !== "all") {
    whereConditions.push(sql`LOWER(c.name) = LOWER(${category})`);
  }

  // PRICE RANGE
  if (minPrice) {
    whereConditions.push(sql`p.price >= ${parseFloat(minPrice)}`);
  }

  if (maxPrice) {
    whereConditions.push(sql`p.price <= ${parseFloat(maxPrice)}`);
  }

  // SEARCH
  if (search) {
    whereConditions.push(
      sql`(p.name ILIKE ${`%${search}%`} OR p.description ILIKE ${`%${search}%`})`
    );
  }

  // SELLER FILTER
  if (sellerId) {
    whereConditions.push(sql`p.seller_id = ${sellerId}`);
  }

  // BUILD WHERE CLAUSE
  let whereClause = sql``;
  if (whereConditions.length > 0) {
    whereClause = sql`WHERE ${whereConditions[0]}`;
    for (let i = 1; i < whereConditions.length; i++) {
      whereClause = sql`${whereClause} AND ${whereConditions[i]}`;
    }
  }

  // SORTING
  let orderBy = sql`p.created_at DESC`;

  if (sort === "price_low") orderBy = sql`p.price ASC`;
  if (sort === "price_high") orderBy = sql`p.price DESC`;
  if (sort === "rating") orderBy = sql`pr.avg_rating DESC NULLS LAST`;

  // MAIN QUERY: PRODUCTS + AVG RATING + REVIEW COUNT
  const products = await sql`
    SELECT 
      p.id AS product_id,
      p.name,
      p.price,
      p.description,
      p.images,
      p.stock,
      s.name AS seller_name,
      c.name AS category,

      -- Product rating summary
      COALESCE(pr.avg_rating, 0) AS rating,
      COALESCE(pr.total_reviews, 0) AS total_reviews

    FROM products p
    JOIN sellers s ON p.seller_id = s.seller_id
    JOIN categories c ON p.category_id = c.id

    -- LEFT JOIN review summary
    LEFT JOIN (
        SELECT 
          product_id,
          AVG(rating) AS avg_rating,
          COUNT(*) AS total_reviews
        FROM product_reviews
        GROUP BY product_id
    ) pr ON pr.product_id = p.id

    ${whereClause}
    ORDER BY ${orderBy}
  `;

  // FORMAT OUTPUT
  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    rating: Number(p.rating) || 0,
    total_reviews: Number(p.total_reviews) || 0,
    image_url: p.images?.[0] ?? null,
  }));

  return NextResponse.json(formattedProducts, { status: 200 });
}

// CREATE PRODUCT
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
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 }
    );
  }

  const { name, description, price, category, images, stock } = validation.data;

  const categoryResult = await sql`
    SELECT id FROM categories WHERE name = ${category}
  `;
  if (categoryResult.length === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const category_id = categoryResult[0].id;

  const product = await sql`
    INSERT INTO products (seller_id, name, description, price, category_id, images, stock)
    VALUES (${user.seller_id!}, ${name}, ${description}, ${price}, ${category_id}, ${images || []}, ${stock || 0})
    RETURNING id, name, description, price, category_id, images, stock, created_at
  `;

  return NextResponse.json(product[0], { status: 201 });
}

export const GET = withErrorHandler(getProducts);
export const POST = withErrorHandler(createProduct);
