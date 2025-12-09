import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    return NextResponse.json({ access_token: newAccessToken }, { status: 200 });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}