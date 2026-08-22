export async function changePassword(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  try {
    const db = getDb();
    const settingsSnap = await db.ref("settings/config").get();
    const settings = settingsSnap.val() || {};
    const adminEmail = settings.email || process.env.SMTP_USER || "admin@mightymemories.com";

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store temporarily in Firebase
    await db.ref("settings/passwordVerification").set({
      password: newPassword,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via email
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
        subject: "Security Alert: Verify Admin Password Change",
        text: `Someone (hopefully you) requested to change the Admin password.\n\nYour OTP is: ${otp}\n\nIf you did not request this, ignore this email. This OTP expires in 10 minutes.`,
      });
    }

    redirect("/mightymemoriesadmin/settings/verify-password");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    console.error(error);
  }
}

export async function verifyPasswordOTP(formData: FormData) {
  const enteredOtp = formData.get("otp") as string;
  
  try {
    const db = getDb();
    const verificationSnap = await db.ref("settings/passwordVerification").get();
    
    if (!verificationSnap.exists()) {
      return { error: "No password change in progress." };
    }
    
    const { password, otp, expiresAt } = verificationSnap.val();
    
    if (Date.now() > expiresAt) {
      await db.ref("settings/passwordVerification").remove();
      return { error: "OTP has expired. Please try again." };
    }
    
    if (enteredOtp !== otp) {
      return { error: "Invalid OTP. Please try again." };
    }
    
    // OTP is valid! Save the password
    await db.ref("settings/config").update({
      password,
      updatedAt: new Date().toISOString(),
    });
    
    // Clean up
    await db.ref("settings/passwordVerification").remove();
    
    revalidatePath("/mightymemoriesadmin");
    revalidatePath("/mightymemoriesadmin/settings");
    redirect("/mightymemoriesadmin/settings");
  } catch (error) {
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    console.error(error);
    return { error: "An error occurred." };
  }
}
