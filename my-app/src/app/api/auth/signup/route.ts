import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import jwt from "jsonwebtoken";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      bio,
      birthday,
      profile_image,
      is_seller,
      category,
      description,
      location,
      years_active,
      rating,
      reviews,
      followers
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    if (useMock) {
      // Mock signup - just return success
      const seller = {
        seller_id: Date.now().toString(),
        email,
        name,
        bio: bio || null,
        profile_image: profile_image || null,
        birthday: birthday || null,
        created_at: new Date().toISOString(),
      };
      const token = jwt.sign(
        { sellerId: seller.seller_id, email: seller.email, name: seller.name },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      return NextResponse.json({
        message: "Account created successfully",
        token,
        seller
      }, { status: 201 });
    } else {
      // Production: Create seller in database
      // First check if seller exists
      const existingSeller = await sql`
        SELECT seller_id FROM sellers WHERE email = ${email}
      `;

      if (existingSeller.length > 0) {
        return NextResponse.json({ error: "Seller with this email already exists" }, { status: 400 });
      }

      // Create seller
      const newSeller = await sql`
        INSERT INTO sellers (email, password_hash, name, bio, profile_image, birthday, category, description, location, rating, reviews, years_active, followers)
        VALUES (${email}, crypt(${password}, gen_salt('bf')), ${name}, ${bio}, ${profile_image}, ${birthday}, ${category}, ${description}, ${location}, ${rating || 0}, ${reviews || 0}, ${years_active || 0}, ${followers || 0})
        RETURNING seller_id, email, name, bio, profile_image, birthday, category, description, location, rating, reviews, years_active, followers, created_at
      `;

      const seller = newSeller[0];
      const token = jwt.sign(
        { sellerId: seller.seller_id, email: seller.email, name: seller.name },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      return NextResponse.json({
        message: "Account created successfully",
        token,
        seller
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}