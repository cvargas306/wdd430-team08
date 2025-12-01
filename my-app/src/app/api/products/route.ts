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
  let params = [];
  let paramIndex = 1;

  if (category && category !== 'all') {
    whereConditions.push(`c.name = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice) {
    whereConditions.push(`p.price >= $${paramIndex}`);
    params.push(parseFloat(minPrice));
    paramIndex++;
  }

  if (maxPrice) {
    whereConditions.push(`p.price <= $${paramIndex}`);
    params.push(parseFloat(maxPrice));
    paramIndex++;
  }

  if (search) {
    whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (sellerId) {
    whereConditions.push(`p.seller_id = $${paramIndex}`);
    params.push(sellerId);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  let orderBy = 'p.created_at DESC';
  if (sort === 'price_low') orderBy = 'p.price ASC';
  else if (sort === 'price_high') orderBy = 'p.price DESC';
  else if (sort === 'rating') orderBy = 's.rating DESC';

  const products = await sql.unsafe(`
    SELECT p.id as product_id, p.name, p.price, p.description, p.images[1] as image_url, p.stock,
           s.name as seller, s.rating, s.reviews,
           c.name as category
    FROM products p
    JOIN sellers s ON p.seller_id = s.seller_id
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
  `, params);

  return NextResponse.json(products, { status: 200 });
}

async function createProduct(req: NextRequest) {
  const user = requireSeller(req);
  const body = await req.json();

  const validation = validateData(createProductSchema, body);
  if (!validation.success) {
    throw validation.errors;
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


