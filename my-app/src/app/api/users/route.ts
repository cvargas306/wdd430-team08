import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, getUserFromRequest } from "@/lib/error-handler";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

// First, I need to add the updateUserSchema to validations
// But for now, let's create a simple one

async function getUser(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await sql`
    SELECT user_id, email, name, is_seller, created_at
    FROM users
    WHERE user_id = ${user.user_id}
  `;

  if (userData.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userData[0], { status: 200 });
}

async function updateUser(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Simple validation for name and email
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  // Check if email is already taken by another user
  const existingUser = await sql`
    SELECT user_id FROM users WHERE email = ${email} AND user_id != ${user.user_id}
  `;

  if (existingUser.length > 0) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const updatedUser = await sql`
    UPDATE users
    SET name = ${name}, email = ${email}
    WHERE user_id = ${user.user_id}
    RETURNING user_id, email, name, is_seller, created_at
  `;

  return NextResponse.json(updatedUser[0], { status: 200 });
}

export const GET = withErrorHandler(getUser);
export const PUT = withErrorHandler(updateUser);