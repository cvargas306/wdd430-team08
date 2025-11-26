import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = false;

const mockSellers: Seller[] = [
  {
    seller_id: "1",
    name: "Clay & Light Studio",
    category: "Ceramics & Pottery",
    description: "Specializes in handcrafted ceramic pieces featuring earth-inspired glazes.",
    location: "Portland, Oregon",
    rating: 4.9,
    reviews: 324,
    years_active: 5,
    followers: 2840,
    email: "claylight@example.com",
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    seller_id: "2",
    name: "Sustainable Textiles Co",
    category: "Organic Textiles",
    description: "Produces premium organic linens and hand-dyed fabrics through zero-waste methods.",
    location: "Portland, Oregon",
    rating: 4.8,
    reviews: 287,
    years_active: 3,
    followers: 1920,
    email: "sustainable@example.com",
    created_at: "2021-01-01T00:00:00Z",
  },
];

interface Seller {
  seller_id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  years_active: number;
  followers: number;
  image?: string;
  email: string;
  created_at: string;
}

// GET: fetch all sellers
export async function GET(req: NextRequest) {
  try {
    if (useMock) {
      return NextResponse.json(mockSellers, { status: 200 });
    } else {
      const sellers: Seller[] = await sql<Seller[]>`SELECT seller_id, name, category, description, location, rating, reviews, years_active, followers, image, email, created_at FROM sellers ORDER BY created_at DESC`;
      return NextResponse.json(sellers, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: add a new seller
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description, location, rating, reviews, years_active, followers, image, email, password_hash } = body;

    if (!name || !email || !password_hash || !category || !description || !location) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const newSeller: Seller[] = await sql<Seller[]>`
      INSERT INTO sellers (name, category, description, location, rating, reviews, years_active, followers, image, email, password_hash)
      VALUES (${name}, ${category}, ${description}, ${location}, ${rating || 0}, ${reviews || 0}, ${years_active || 0}, ${followers || 0}, ${image || null}, ${email}, ${password_hash})
      RETURNING seller_id, name, category, description, location, rating, reviews, years_active, followers, image, email, created_at
    `;

    return NextResponse.json(newSeller[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
