import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large (max 5MB)" }, { status: 400 });
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY!;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT!;

    const timestamp = Math.floor(Date.now() / 1000);
    const expire = timestamp + 30 * 60; // 30 minutes
    const token = crypto.randomBytes(16).toString("hex");

    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire.toString())
      .digest("hex");

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("publicKey", publicKey);
    uploadFormData.append("signature", signature);
    uploadFormData.append("expire", expire.toString());
    uploadFormData.append("token", token);
    uploadFormData.append("useUniqueFileName", "true");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "Upload failed", details: errorData }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.url,
      fileId: data.fileId,
      name: data.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}