import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { setAuthCookies, hashPassword } from "@/lib/auth-server";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

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

    // Check if user exists
    const existingUser = await sql`
      SELECT user_id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, is_seller)
      VALUES (${email}, ${passwordHash}, ${name}, ${is_seller || false})
      RETURNING user_id, email, name, is_seller
    `;

    let sellerId = null;
    // If seller, create seller profile
    if (is_seller) {
      const newSeller = await sql`
        INSERT INTO sellers (user_id, name, category, description, location, rating, reviews, years_active, followers)
        VALUES (${newUser[0].user_id}, ${name}, ${category}, ${description}, ${location}, ${rating || 0}, ${reviews || 0}, ${years_active || 0}, ${followers || 0})
        RETURNING seller_id
      `;
      sellerId = newSeller[0].seller_id;
    }

    // Create user payload for JWT
    const userPayload = {
      user_id: newUser[0].user_id,
      email: newUser[0].email,
      name: newUser[0].name,
      is_seller: newUser[0].is_seller,
      seller_id: sellerId || undefined,
    };

    // Set HTTP-only cookies with JWT tokens
    await setAuthCookies(userPayload);

    return NextResponse.json({
      message: "Account created successfully",
      user: userPayload
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}