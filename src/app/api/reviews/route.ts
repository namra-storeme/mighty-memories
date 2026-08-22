import { NextResponse } from "next/server";
import { uploadToGCS } from "@/lib/gcs";
import { getDb } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userName = formData.get("userName") as string;
    const rating = parseInt(formData.get("rating") as string, 10);
    const text = formData.get("text") as string;
    const photo = formData.get("photo") as File | null;

    if (!userName || !rating || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let photoUrl = null;
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const filename = `review-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      photoUrl = await uploadToGCS(buffer, "mighty-memories/reviews", filename, photo.type);
    }

    const db = getDb();
    const newRef = db.ref("reviews").push();
    const review = {
      id: newRef.key,
      userName,
      rating,
      text,
      photoUrl,
      createdAt: new Date().toISOString(),
    };
    await newRef.set(review);

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review submit error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const snap = await db.ref("reviews").orderByChild("createdAt").get();
    const reviews: any[] = [];
    if (snap.exists()) {
      snap.forEach((child) => {
        reviews.unshift({ id: child.key, ...child.val() });
      });
    }
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
