import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId, rating, text, userName, userImage } = await req.json();

    if (!orderId || !rating || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({ where: { orderId } });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this order." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        rating,
        text,
        userName,
        userImage: userImage || null,
      },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
