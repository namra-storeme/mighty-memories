import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { uploadToCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const comments = formData.get("comments") as string;
    const customerImage = formData.get("customerImage") as string | null;

    // Upload each photo to Cloudinary
    const photoPaths: string[] = [];

    // The frontend sends keys like photo-0, photo-1, etc.
    // It also sends qty-0, qty-1, but the total quantity is still passed.
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo-") && value instanceof File && value.size > 0) {
        const index = key.split("-")[1];
        const qty = formData.get(`qty-${index}`) as string || "1";
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `order-${Date.now()}-${Math.random().toString(36).substring(7)}-photo${index}`;
        const url = await uploadToCloudinary(buffer, "mighty-memories/orders", filename);
        // We save the URL. If the user wants 50 copies of it, it's tracked in the comment we appended on the frontend.
        photoPaths.push(url);
      }
    }

    // Save order to database
    const order = await prisma.order.create({
      data: {
        name, email, phone, quantity, comments, customerImage,
        photos: { create: photoPaths.map((url) => ({ url })) },
      },
    });

    // Send email notification to admin
    const settings = await prisma.adminSettings.findUnique({ where: { id: 1 } });
    const adminEmail = settings?.email || process.env.SMTP_USER || "admin@mightymemories.com";

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const photoHtml = photoPaths.length > 0
        ? `<div style="margin-top:16px;">
            <p style="color:#6b7280;font-size:14px;margin-bottom:8px;"><strong>${photoPaths.length} photo(s) uploaded to cloud:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${photoPaths.map(url => `<a href="${url}" target="_blank"><img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;" /></a>`).join("")}
            </div>
          </div>`
        : "";

      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        replyTo: `"${name}" <${email}>`,
        subject: `🧲 New Order #${order.id} from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;">
              <h1 style="margin:0;font-size:24px;">🧲 New Order Received!</h1>
              <p style="margin:8px 0 0;opacity:0.85;">Order #${order.id} — ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            </div>
            <div style="padding:28px 32px;background:#fff;">
              <h2 style="margin:0 0 20px;color:#111827;font-size:18px;">Customer Details</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;width:35%;">Name</td><td style="padding:10px 0;color:#111827;font-weight:700;">${name}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Email</td><td style="padding:10px 12px;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Phone</td><td style="padding:10px 0;color:#111827;">${phone}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Quantity</td><td style="padding:10px 12px;color:#111827;font-weight:700;">${quantity} Sticker${quantity > 1 ? "s" : ""}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Comments</td><td style="padding:10px 0;color:#111827;">${comments || "None"}</td></tr>
              </table>
              ${photoHtml}
              <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:8px;border-left:4px solid #2563eb;">
                <p style="margin:0;color:#1e40af;font-size:14px;">💡 <strong>Tip:</strong> Hit "Reply" to respond directly to <strong>${name}</strong> at ${email}.</p>
              </div>
              <div style="margin-top:20px;">
                <a href="${process.env.NEXTAUTH_URL}/mightymemoriesadmin/orders"
                   style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                  View in Admin Panel →
                </a>
              </div>
            </div>
            <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">m2 mighty memories — Custom Magnet Stickers</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Email sent to ${adminEmail} | Reply-To: ${email}`);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: unknown) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
