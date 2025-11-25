import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

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
    const sellers: Seller[] = await sql<Seller[]>`SELECT seller_id, name, category, description, location, rating, reviews, years_active, followers, image, email, created_at FROM sellers ORDER BY created_at DESC`;
    return NextResponse.json(sellers, { status: 200 });
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
