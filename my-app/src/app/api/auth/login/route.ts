import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { setAuthCookies, hashPassword, verifyPassword } from "@/lib/auth-server";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check database
    const users = await sql`
      SELECT u.user_id, u.email, u.name, u.is_seller, u.password_hash, s.seller_id
      FROM users u
      LEFT JOIN sellers s ON u.user_id = s.user_id
      WHERE u.email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create user payload for JWT
    const userPayload = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      is_seller: user.is_seller,
      seller_id: user.seller_id || undefined,
    };

    // Set HTTP-only cookies with JWT tokens
    await setAuthCookies(userPayload);

    // Return user data (without sensitive info)
    return NextResponse.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        is_seller: user.is_seller,
        seller_id: user.seller_id,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}