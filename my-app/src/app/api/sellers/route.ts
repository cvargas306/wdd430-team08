import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

interface Seller {
  seller_id: string;
  name: string;
  email: string;
  created_at: string;
}

// GET: fetch all sellers
export async function GET(req: NextRequest) {
  try {
    const sellers: Seller[] = await sql<Seller[]>`SELECT * FROM sellers ORDER BY created_at DESC`;
    return NextResponse.json(sellers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: add a new seller
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password_hash } = body;

    if (!name || !email || !password_hash) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const newSeller: Seller[] = await sql<Seller[]>`
      INSERT INTO sellers (name, email, password_hash)
      VALUES (${name}, ${email}, ${password_hash})
      RETURNING seller_id, name, email, created_at
    `;

    return NextResponse.json(newSeller[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
