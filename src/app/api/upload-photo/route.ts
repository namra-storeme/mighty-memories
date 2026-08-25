import { NextResponse } from "next/server";
import { uploadToGCS } from "@/lib/gcs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `order-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const contentType = file.type || "image/jpeg";

    const url = await uploadToGCS(buffer, "mighty-memories/orders", filename, contentType);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
