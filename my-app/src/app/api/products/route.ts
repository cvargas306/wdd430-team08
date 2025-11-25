import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

interface Product {
  product_id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

/* ---------------------------------------------
    GET: Fetch all products or filter by seller_id
 ---------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('seller_id');

    let products;
    if (sellerId) {
      products = await sql<Product[]>`
        SELECT *
        FROM products
        WHERE seller_id = ${sellerId}
        ORDER BY created_at DESC
      `;
    } else {
      products = await sql<Product[]>`
        SELECT *
        FROM products
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ---------------------------------------------
   POST: Create a new product
---------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      seller_id,
      name,
      description,
      price,
      quantity,
      image_url,
      category,
    } = body;

    if (!seller_id || !name || !price) {
      return NextResponse.json(
        { error: "seller_id, name, and price are required" },
        { status: 400 }
      );
    }

    const newProduct = await sql<Product[]>`
      INSERT INTO products (
        seller_id, name, description, price, quantity, image_url, category
      )
      VALUES (
        ${seller_id}, ${name}, ${description}, ${price}, ${quantity},
        ${image_url}, ${category}
      )
      RETURNING *
    `;

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
