import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import jwt from "jsonwebtoken";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = process.env.NODE_ENV === 'development';

interface Seller {
  seller_id: string;
  email: string;
  name: string;
  bio?: string | null;
  profile_image?: string | null;
  birthday?: string | null;
  created_at: string;
}

const mockSellers: Seller[] = [
  {
    seller_id: "1",
    email: "seller@example.com",
    name: "Clay & Light Studio",
    bio: "Specializes in handcrafted ceramic pieces featuring earth-inspired glazes.",
    profile_image: null,
    birthday: null,
    created_at: "2020-01-01T00:00:00Z",
  },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (useMock) {
      // Mock authentication
      const seller = mockSellers.find(s => s.email === email);
      if (seller && password === "password") { // Simple mock password
        const token = jwt.sign(
          { sellerId: seller.seller_id, email: seller.email, name: seller.name },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );
        return NextResponse.json({ token, seller }, { status: 200 });
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      // Production: Check database
      const sellers = await sql`
        SELECT seller_id, email, name, bio, profile_image, birthday, created_at
        FROM sellers
        WHERE email = ${email} AND password_hash = crypt(${password}, password_hash)
      `;

      if (sellers.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const seller = sellers[0];
      const token = jwt.sign(
        { sellerId: seller.seller_id, email: seller.email, name: seller.name },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return NextResponse.json({ token, seller }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}