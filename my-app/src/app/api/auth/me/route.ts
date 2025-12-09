import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken();

    // If user is NOT logged in — return a safe JSON response
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Logged-in user
    return NextResponse.json({ user }, { status: 200 });

  } catch (error: any) {
    console.error("Get user error:", error);

    // Even in an error, return structured JSON
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
