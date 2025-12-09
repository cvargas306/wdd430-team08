import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    await clearAuthCookies();
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}