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

// PUT: update a seller
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, category, description, location, rating, reviews, years_active, followers, image, email } = body;

    const updatedSeller: Seller[] = await sql<Seller[]>`
      UPDATE sellers
      SET name = ${name}, category = ${category}, description = ${description}, location = ${location}, rating = ${rating}, reviews = ${reviews}, years_active = ${years_active}, followers = ${followers}, image = ${image}, email = ${email}
      WHERE seller_id = ${id}
      RETURNING seller_id, name, category, description, location, rating, reviews, years_active, followers, image, email, created_at
    `;

    if (updatedSeller.length === 0) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSeller[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: delete a seller
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const deletedSeller: Seller[] = await sql<Seller[]>`
      DELETE FROM sellers
      WHERE seller_id = ${id}
      RETURNING seller_id, name, category, description, location, rating, reviews, years_active, followers, image, email, created_at
    `;

    if (deletedSeller.length === 0) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(deletedSeller[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}