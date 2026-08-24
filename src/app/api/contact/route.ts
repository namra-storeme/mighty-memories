import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, phone, comment } = await req.json();

    if (!name || !email || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const newMsgRef = db.ref("messages").push();
    
    await newMsgRef.set({
      name,
      email,
      phone: phone || "",
      comment,
      status: "New",
      createdAt: new Date().toISOString(),
    });

    // Fetch admin email from settings
    const settingsSnap = await db.ref("settings/config").get();
    const settings = settingsSnap.val();
    const adminEmail = settings?.email || process.env.SMTP_USER;

    // Send email to admin
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        replyTo: `"${name}" <${email}>`,
        subject: `New Contact Message from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#000,#333);color:white;padding:28px 32px;">
              <h1 style="margin:0;font-size:24px;">New Contact Message</h1>
            </div>
            <div style="padding:32px;background:#fff;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;"><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
              
              <h2 style="margin:0 0 12px;color:#111827;font-size:16px;">Message:</h2>
              <div style="background:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb;color:#374151;white-space:pre-wrap;">${comment}</div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
