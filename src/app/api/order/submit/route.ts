import { NextResponse } from "next/server";
import { uploadToGCS } from "@/lib/gcs";
import { getDb } from "@/lib/firebase";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const comments = formData.get("comments") as string || "";
    const totalAmount = parseFloat(formData.get("totalAmount") as string) || 0;
    const productType = formData.get("productType") as string;
    const packageDetails = formData.get("packageDetails") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name || !email || !phone || !address || !productType) {
      return NextResponse.json({ error: "Missing required contact details" }, { status: 400 });
    }

    // Upload photos to GCS
    const photos: { url: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo-") && value instanceof File && value.size > 0) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `order-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const publicUrl = await uploadToGCS(buffer, "mighty-memories/orders", filename, value.type);
        photos.push({ url: publicUrl });
      }
    }

    // Generate a clean readable Order ID
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `MM-${randomChars}`;

    // Save order to Firebase Realtime Database
    const db = getDb();
    const newOrderRef = db.ref(`orders/${orderId}`);

    const orderData = {
      id: orderId,
      name,
      email,
      phone,
      address,
      quantity,
      totalAmount,
      comments,
      productType,
      packageDetails,
      status: "New",
      photos,
      createdAt: new Date().toISOString(),
    };

    await newOrderRef.set(orderData);

    // Fetch admin settings for email
    const settingsSnap = await db.ref("settings/config").get();
    const settings = settingsSnap.val();
    const adminEmail = settings?.adminEmail || process.env.SMTP_USER;

    // 3. Send Emails via SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const photoHtml = photos.length > 0
        ? `<div style="margin-top:20px;padding-top:20px;border-top:1px dashed #e5e7eb;">
            <p style="color:#4b5563;font-size:14px;margin-bottom:12px;"><strong>Uploaded Photos:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${photos.map((p) => `<a href="${p.url}" target="_blank"><img src="${p.url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" /></a>`).join("")}
            </div>
          </div>`
        : "";

      const adminSub = settings?.adminNewOrderSubject || `🎉 New Order from ${name}`;
      const adminBody = settings?.adminNewOrderBody || `You have received a new order. Please check the admin dashboard for details.`;
      const receiptSub = settings?.receiptEmailSubject || "Your Order is Processing! - m2 Mighty Memories";
      const receiptBody = settings?.receiptEmailBody || "Thank you for your order! Your order is currently processing.";

      const adminEmailPromise = transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        replyTo: `"${name}" <${email}>`,
        subject: adminSub,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;">
              <h1 style="margin:0;font-size:24px;">🎉 New Order Received!</h1>
              <p style="margin:8px 0 0;opacity:0.85;">Total $${totalAmount.toFixed(2)} AUD</p>
            </div>
            <div style="padding:28px 32px;background:#fff;">
              <p style="color:#111827;font-size:16px;line-height:1.5;margin-bottom:24px;">${adminBody.replace(/\n/g, '<br>')}</p>
              <h2 style="margin:0 0 20px;color:#111827;font-size:18px;">Order Details</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;width:35%;">Product</td><td style="padding:10px 0;color:#111827;font-weight:700;">${productType}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Package</td><td style="padding:10px 12px;color:#111827;">${packageDetails}</td></tr>
              </table>
              <h2 style="margin:0 0 20px;color:#111827;font-size:18px;border-top:1px solid #e5e7eb;padding-top:20px;">Customer Details</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;width:35%;">Name</td><td style="padding:10px 0;color:#111827;font-weight:700;">${name}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Email</td><td style="padding:10px 12px;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Phone</td><td style="padding:10px 0;color:#111827;">${phone}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;font-weight:600;">Address</td><td style="padding:10px 12px;color:#111827;">${address}</td></tr>
                <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;">Comments</td><td style="padding:10px 0;color:#111827;">${comments || "None"}</td></tr>
              </table>
              ${photoHtml}
            </div>
          </div>
        `,
      });

      const customerPhotoHtml = photos.length > 0
        ? `<div style="margin-top:20px;padding-top:20px;border-top:1px dashed #e5e7eb;">
            <p style="color:#4b5563;font-size:14px;margin-bottom:12px;"><strong>Your Uploaded Photos:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${photos.map((p) => `<img src="${p.url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" />`).join("")}
            </div>
          </div>`
        : "";

      const customerEmailPromise = transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: email,
        subject: receiptSub,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;">Order Received!</h1>
            </div>
            <div style="padding:32px;background:#fff;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">Hi ${name.split(" ")[0]},</h2>
              <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.5;">${receiptBody.replace(/\n/g, '<br>')}</p>
              <div style="background:#f9fafb;padding:20px;border-radius:12px;border:1px solid #e5e7eb;">
                <h3 style="margin:0 0 16px;color:#111827;font-size:16px;">Order Summary</h3>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#4b5563;">
                  <span>${productType} (${packageDetails})</span>
                  <span style="font-weight:600;color:#111827;">$${totalAmount.toFixed(2)} AUD</span>
                </div>
              </div>
              <div style="margin-top:24px;">
                <h3 style="margin:0 0 8px;color:#111827;font-size:16px;">Shipping To:</h3>
                <p style="margin:0;color:#6b7280;line-height:1.5;">${name}<br>${address.replace(/\n/g, "<br>")}</p>
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

      const results = await Promise.allSettled([adminEmailPromise, customerEmailPromise]);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Email sending failed for ${index === 0 ? "Admin" : "Customer"}:`, result.reason);
        }
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: unknown) {
    console.error("Order Submit error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
