"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase";
import { uploadToGCS, deleteFromGCS } from "@/lib/gcs";
import nodemailer from "nodemailer";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const db = getDb();
  const settingsSnap = await db.ref("settings/config").get();
  const settings = settingsSnap.val() || {};
  const expectedEmail = settings.email || process.env.SMTP_USER || "admin@mightymemories.com";
  const expectedPassword = settings.password || process.env.ADMIN_PASSWORD || "admin123";

  if (password === expectedPassword && email.trim().toLowerCase() === expectedEmail.trim().toLowerCase()) {
    (await cookies()).set("adminAuth", "true", {
      secure: false,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/mightymemoriesadmin");
  } else {
    redirect("/mightymemoriesadmin?error=invalid");
  }
}

export async function logout() {
  (await cookies()).delete("admin_token");
  redirect("/mightymemoriesadmin");
}

export async function initiateEmailChange() {
  try {
    const db = getDb();
    const settingsSnap = await db.ref("settings/config").get();
    const currentEmail = settingsSnap.val()?.email || process.env.SMTP_USER || "admin@mightymemories.com";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.ref("settings/authFlows/email_old").set({
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: currentEmail,
        subject: "Verify Identity to Change Admin Email",
        text: `You requested to change your admin email. Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      });
    }
    redirect("/mightymemoriesadmin/settings/verify-email-old");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    console.error(error);
  }
}

export async function verifyOldEmailOTP(formData: FormData) {
  const enteredOtp = formData.get("otp") as string;
  try {
    const db = getDb();
    const snap = await db.ref("settings/authFlows/email_old").get();
    if (!snap.exists()) return { error: "No verification in progress." };
    const { otp, expiresAt } = snap.val();
    
    if (Date.now() > expiresAt) {
      await db.ref("settings/authFlows/email_old").remove();
      return { error: "OTP expired." };
    }
    if (enteredOtp !== otp) return { error: "Invalid OTP." };
    
    await db.ref("settings/authFlows/email_old").update({ verified: true });
    redirect("/mightymemoriesadmin/settings/change-email");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return { error: "An error occurred." };
  }
}

export async function submitNewEmail(formData: FormData) {
  const newEmail = formData.get("newEmail") as string;
  try {
    const db = getDb();
    const oldSnap = await db.ref("settings/authFlows/email_old").get();
    if (!oldSnap.exists() || !oldSnap.val().verified) {
      return { error: "Not authorized." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.ref("settings/authFlows/email_new").set({
      newEmail,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: newEmail,
        subject: "Verify New Admin Email",
        text: `Please verify your new email address. Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      });
    }
    redirect("/mightymemoriesadmin/settings/verify-email-new");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return { error: "An error occurred." };
  }
}

export async function verifyNewEmailOTP(formData: FormData) {
  const enteredOtp = formData.get("otp") as string;
  try {
    const db = getDb();
    const snap = await db.ref("settings/authFlows/email_new").get();
    if (!snap.exists()) return { error: "No verification in progress." };
    const { otp, expiresAt, newEmail } = snap.val();
    
    if (Date.now() > expiresAt) {
      await db.ref("settings/authFlows/email_new").remove();
      return { error: "OTP expired." };
    }
    if (enteredOtp !== otp) return { error: "Invalid OTP." };
    
    await db.ref("settings/config").update({ email: newEmail, updatedAt: new Date().toISOString() });
    await db.ref("settings/authFlows/email_old").remove();
    await db.ref("settings/authFlows/email_new").remove();
    
    revalidatePath("/mightymemoriesadmin");
    redirect("/mightymemoriesadmin/settings");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return { error: "An error occurred." };
  }
}

export async function initiatePasswordChange() {
  try {
    const db = getDb();
    const settingsSnap = await db.ref("settings/config").get();
    const currentEmail = settingsSnap.val()?.email || process.env.SMTP_USER || "admin@mightymemories.com";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.ref("settings/authFlows/password").set({
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
        to: currentEmail,
        subject: "Verify Identity to Change Password",
        text: `You requested to change your admin password. Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      });
    }
    redirect("/mightymemoriesadmin/settings/verify-password-old");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    console.error(error);
  }
}

export async function verifyOldPasswordOTP(formData: FormData) {
  const enteredOtp = formData.get("otp") as string;
  try {
    const db = getDb();
    const snap = await db.ref("settings/authFlows/password").get();
    if (!snap.exists()) return { error: "No verification in progress." };
    const { otp, expiresAt } = snap.val();
    
    if (Date.now() > expiresAt) {
      await db.ref("settings/authFlows/password").remove();
      return { error: "OTP expired." };
    }
    if (enteredOtp !== otp) return { error: "Invalid OTP." };
    
    await db.ref("settings/authFlows/password").update({ verified: true });
    redirect("/mightymemoriesadmin/settings/change-password");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return { error: "An error occurred." };
  }
}

export async function submitNewPassword(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  try {
    const db = getDb();
    const snap = await db.ref("settings/authFlows/password").get();
    if (!snap.exists() || !snap.val().verified) {
      return { error: "Not authorized." };
    }

    await db.ref("settings/config").update({ password: newPassword, updatedAt: new Date().toISOString() });
    await db.ref("settings/authFlows/password").remove();
    
    revalidatePath("/mightymemoriesadmin");
    redirect("/mightymemoriesadmin/settings");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return { error: "An error occurred." };
  }
}

export async function updateEmailTemplate(formData: FormData) {
  const templateId = formData.get("templateId") as string;
  const subject = formData.get(`${templateId}Subject`) as string;
  const body = formData.get(`${templateId}Body`) as string;

  if (!templateId) return;

  try {
    const db = getDb();
    await db.ref("settings/config").update({
      [`${templateId}Subject`]: subject,
      [`${templateId}Body`]: body,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath("/mightymemoriesadmin/emails");
  } catch (error) {
    console.error(error);
  }
}

export async function updateAbout(formData: FormData) {
  const content = formData.get("content") as string;
  const db = getDb();
  await db.ref("settings/about").set({ content });
  revalidatePath("/mightymemoriesadmin");
  revalidatePath("/about");
}

export async function updateOrderStatus(orderId: string, status: string, formData?: FormData) {
  const trackingNumber = formData ? (formData.get("trackingNumber") as string) : undefined;

  const db = getDb();
  const updateData: any = { status };
  if (trackingNumber) updateData.trackingNumber = trackingNumber;

  await db.ref(`orders/${orderId}`).update(updateData);

  // Fetch order for email
  const orderSnap = await db.ref(`orders/${orderId}`).get();
  const order = orderSnap.val();

  // Fetch settings
  const settingsSnap = await db.ref("settings/config").get();
  const settings = settingsSnap.val();

  revalidatePath("/mightymemoriesadmin/orders");

  if (["Processing", "Completed", "Cancelled", "Shipped"].includes(status)) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && order?.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const statusMessages: Record<string, string> = {
          Processing: settings?.processingEmailBody || "We have started processing your custom magnets! We will let you know when they ship.",
          Completed: settings?.completedEmailBody || "Your order is now marked as completed. We hope you love your magnets!",
          Shipped: settings?.shippingEmailBody || "Great news! Your custom stickers have been shipped.",
          Cancelled: settings?.cancelledEmailBody || "Your order has been cancelled. If you have any questions, please contact us.",
        };

        const statusSubjects: Record<string, string> = {
          Processing: settings?.processingEmailSubject || "We're working on your order! - m2 Mighty Memories",
          Completed: settings?.completedEmailSubject || "Your order is complete! - m2 Mighty Memories",
          Shipped: settings?.shippingEmailSubject || "Your Order has Shipped! - m2 Mighty Memories",
          Cancelled: settings?.cancelledEmailSubject || "Order Cancelled - m2 Mighty Memories",
        };

        const emailSubject = statusSubjects[status] || `Order Update: Your magnets are ${status}!`;

        const trackingHtml = (status === "Shipped" && trackingNumber)
          ? `<div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
               <p style="margin:0;color:#166534;font-size:14px;font-weight:bold;">Tracking Number: ${trackingNumber}</p>
             </div>`
          : "";

        await transporter.sendMail({
          from: `"m2 Mighty Memories" <${process.env.SMTP_USER}>`,
          to: order.email,
          subject: emailSubject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;font-size:24px;">Order Status Update</h1>
              </div>
              <div style="padding:32px;background:#fff;">
                <h2 style="margin:0 0 12px;color:#111827;">Hi ${order.name?.split(" ")[0] || "there"},</h2>
                <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.5;">${statusMessages[status]}</p>
                <div style="background:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb;">
                  <p style="margin:0;color:#6b7280;font-size:14px;">Product: <strong>${order.productType || ""}</strong></p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Package: <strong>${order.packageDetails || ""}</strong></p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">Status: <strong style="color:#2563eb;">${status}</strong></p>
                  ${trackingHtml}
                </div>
              </div>
              <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">m2 mighty memories — Custom Magnet Stickers</p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send status email:", err);
      }
    }
  }
}

export async function uploadPortfolioPhoto(formData: FormData) {
  try {
    console.log("[Upload] Step 1: Starting upload action");
    const file = formData.get("photo") as File | null;
    if (!file || file.size === 0) return { error: "No file uploaded" };

    console.log("[Upload] Step 2: File received, size:", file.size, "type:", file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[Upload] Step 3: Buffer created, size:", buffer.length);

    const filename = `portfolio-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    console.log("[Upload] Step 4: Uploading to GCS, filename:", filename);

    const publicUrl = await uploadToGCS(buffer, "mighty-memories/portfolio", filename, file.type);
    console.log("[Upload] Step 5: GCS upload SUCCESS, url:", publicUrl);

    const db = getDb();
    console.log("[Upload] Step 6: Saving to Firebase...");
    await db.ref("portfolioImages").push({
      url: publicUrl,
      createdAt: new Date().toISOString(),
    });
    console.log("[Upload] Step 7: Firebase save SUCCESS");

    revalidatePath("/");
    revalidatePath("/mightymemoriesadmin");
    console.log("[Upload] Step 8: Done!");
  } catch (error: any) {
    console.error("[Upload] CAUGHT ERROR at:", error?.message);
    console.error("[Upload] Full error:", error);
    return { error: "Failed to upload: " + (error?.message || "Unknown error") };
  }
}

export async function deletePortfolioPhoto(id: string, url: string) {
  try {
    await deleteFromGCS(url);
    const db = getDb();
    await db.ref(`portfolioImages/${id}`).remove();
    revalidatePath("/mightymemoriesadmin");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete portfolio photo", error);
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const db = getDb();
    await db.ref(`reviews/${reviewId}`).remove();
    revalidatePath("/mightymemoriesadmin/reviews");
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting review:", error);
  }
}
