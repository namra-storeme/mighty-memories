import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const data = await req.json();
    const { orderId } = await params;
    const parsedOrderId = parseInt(orderId, 10);

    const order = await prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        status: "Paid",
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        totalAmount: data.totalAmount,
      },
      include: { photos: true },
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

      const photoHtml = order.photos.length > 0
        ? `<div style="margin-top:16px;">
            <p style="color:#6b7280;font-size:14px;margin-bottom:8px;"><strong>${order.photos.length} photo(s) uploaded to cloud:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${order.photos.map(p => `<a href="${p.url}" target="_blank"><img src="${p.url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;" /></a>`).join("")}
            </div>
          </div>`
        : "";

      // 1. Send Email to Admin
      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        replyTo: `"${order.name}" <${order.email}>`,
        subject: `🎉 New Paid Order #${order.id} from ${order.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;">
              <h1 style="margin:0;font-size:24px;">🎉 New Order Received!</h1>
              <p style="margin:8px 0 0;opacity:0.85;">Order #${order.id} — Paid $${order.totalAmount.toFixed(2)} AUD</p>
            </div>
            <div style="padding:28px 32px;background:#fff;">
              <h2 style="margin:0 0 20px;color:#111827;font-size:18px;">Customer Details</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;width:35%;">Name</td><td style="padding:10px 0;color:#111827;font-weight:700;">${order.name}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Email</td><td style="padding:10px 12px;"><a href="mailto:${order.email}" style="color:#2563eb;">${order.email}</a></td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Phone</td><td style="padding:10px 0;color:#111827;">${order.phone}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Address</td><td style="padding:10px 12px;color:#111827;">${order.address}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Quantity</td><td style="padding:10px 0;color:#111827;font-weight:700;">${order.quantity} Sticker${order.quantity > 1 ? "s" : ""}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Comments</td><td style="padding:10px 12px;color:#111827;">${order.comments || "None"}</td></tr>
              </table>
              ${photoHtml}
            </div>
            <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">m2 mighty memories — Custom Magnet Stickers</p>
            </div>
          </div>
        `,
      });

      // 2. Send Receipt Email to Customer
      const receiptSubject = settings?.receiptEmailSubject || "Order Confirmation - m2 Mighty Memories";
      const receiptBody = settings?.receiptEmailBody || "Thank you for your order! We are preparing your custom stickers.";
      
      const customerPhotoHtml = order.photos.length > 0
        ? `<div style="margin-top:20px;padding-top:20px;border-top:1px dashed #e5e7eb;">
            <p style="color:#4b5563;font-size:14px;margin-bottom:12px;"><strong>Your Uploaded Photos:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${order.photos.map(p => `<img src="${p.url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" />`).join("")}
            </div>
          </div>`
        : "";

      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: order.email,
        subject: receiptSubject,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;">Thank You for Your Order!</h1>
              <p style="margin:8px 0 0;opacity:0.9;">Order #${order.id}</p>
            </div>
            <div style="padding:32px;background:#fff;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">Hi ${order.name.split(' ')[0]},</h2>
              <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.5;">${receiptBody.replace(/\n/g, '<br>')}</p>
              
              <div style="background:#f9fafb;padding:20px;border-radius:12px;border:1px solid #e5e7eb;">
                <h3 style="margin:0 0 16px;color:#111827;font-size:16px;">Order Summary</h3>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#4b5563;">
                  <span>Custom Magnet Stickers (x${order.quantity})</span>
                  <span style="font-weight:600;color:#111827;">$${order.totalAmount.toFixed(2)} AUD</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #e5e7eb;font-weight:bold;color:#111827;font-size:16px;">
                  <span>Total Paid</span>
                  <span>$${order.totalAmount.toFixed(2)} AUD</span>
                </div>
              </div>
              
              <div style="margin-top:24px;">
                <h3 style="margin:0 0 8px;color:#111827;font-size:16px;">Shipping To:</h3>
                <p style="margin:0;color:#6b7280;line-height:1.5;">${order.name}<br>${order.address.replace(/\n/g, '<br>')}</p>
              </div>

              ${customerPhotoHtml}
            </div>
            <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:14px;">Have questions? Reply directly to this email.</p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">m2 mighty memories — Custom Magnet Stickers</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete Order Error:", error);
    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 });
  }
}
