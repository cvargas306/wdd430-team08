import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
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
      return NextResponse.json({
        message: "Account created successfully",
        user: {
          user_id: Date.now().toString(),
          email,
          name,
          is_seller: is_seller || false,
          ...(is_seller && { seller_id: Date.now().toString() })
        }
      }, { status: 201 });
    } else {
      // Production: Create user in database
      // First check if user exists
      const existingUser = await sql`
        SELECT user_id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
      }

      // Create user
      const newUser = await sql`
        INSERT INTO users (email, password_hash, name, is_seller)
        VALUES (${email}, crypt(${password}, gen_salt('bf')), ${name}, ${is_seller || false})
        RETURNING user_id, email, name, is_seller
      `;

      let sellerId = null;
      // If seller, create seller profile
      if (is_seller) {
        const newSeller = await sql`
          INSERT INTO sellers (name, category, description, location, rating, reviews, years_active, followers, email)
          VALUES (${name}, ${category}, ${description}, ${location}, ${rating || 0}, ${reviews || 0}, ${years_active || 0}, ${followers || 0}, ${email})
          RETURNING seller_id
        `;
        sellerId = newSeller[0].seller_id;
      }

      return NextResponse.json({
        message: "Account created successfully",
        user: {
          ...newUser[0],
          ...(sellerId && { seller_id: sellerId })
        }
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}