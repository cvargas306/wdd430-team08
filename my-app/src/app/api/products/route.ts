import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = false;

const mockProducts: Product[] = [
  {
    product_id: "1",
    seller_id: "1",
    name: "Handcrafted Ceramic Mug",
    description: "Beautiful hand-thrown mug with organic glaze",
    price: 45.00,
    quantity: 10,
    image_url: "/placeholder-image.jpg",
    category: "Ceramics & Pottery",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    product_id: "2",
    seller_id: "1",
    name: "Ceramic Bowl Set",
    description: "Set of 4 nesting bowls",
    price: 120.00,
    quantity: 5,
    image_url: "/placeholder-image.jpg",
    category: "Ceramics & Pottery",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  },
];

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

    if (useMock) {
      let products = mockProducts;
      if (sellerId) {
        products = mockProducts.filter(p => p.seller_id === sellerId);
      }
      return NextResponse.json(products, { status: 200 });
    } else {
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
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ---------------------------------------------
     POST: Create a new product
  ---------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    // Get seller info from middleware
    const sellerId = req.headers.get('x-seller-id');

    if (!sellerId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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

    // Ensure the seller_id matches the authenticated seller's ID
    if (seller_id !== sellerId) {
      return NextResponse.json({ error: "Unauthorized to create products for this seller" }, { status: 403 });
    }

    if (useMock) {
      const newProduct: Product = {
        product_id: Date.now().toString(),
        seller_id,
        name,
        description: description || null,
        price: Number(price),
        quantity: Number(quantity) || 0,
        image_url: image_url || null,
        category: category || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProducts.push(newProduct);
      return NextResponse.json(newProduct, { status: 201 });
    } else {
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
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
