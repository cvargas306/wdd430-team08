import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

const useMock = process.env.NODE_ENV === 'development';

interface User {
  user_id: string;
  email: string;
  name: string;
  is_seller: boolean;
  seller_id?: string;
}

const mockUsers: User[] = [
  {
    user_id: "1",
    email: "seller@example.com",
    name: "Clay & Light Studio",
    is_seller: true,
    seller_id: "1",
  },
  {
    user_id: "2",
    email: "buyer@example.com",
    name: "John Buyer",
    is_seller: false,
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
      const user = mockUsers.find(u => u.email === email);
      if (user && password === "password") { // Simple mock password
        return NextResponse.json(user, { status: 200 });
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      // Production: Check database
      // Assuming there's a users table with email, password_hash, etc.
      const users = await sql<User[]>`
        SELECT user_id, email, name, is_seller, seller_id
        FROM users
        WHERE email = ${email} AND password_hash = crypt(${password}, password_hash)
      `;

      if (users.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json(users[0], { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}