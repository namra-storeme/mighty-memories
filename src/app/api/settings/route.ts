import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Publicly readable so the checkout page knows the price
export async function GET() {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: 1 }
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
