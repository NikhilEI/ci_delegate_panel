import { query } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";
import { generateOtp, OTP_TTL_MINUTES } from "@/lib/otp";

const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body?.email || "").trim();
  const mobile = (body?.mobile || "").trim();

  if (!email || !emailPattern.test(email)) {
    return Response.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (!mobile || !/^[0-9]{6,15}$/.test(mobile)) {
    return Response.json({ success: false, message: "Enter a valid mobile number." }, { status: 400 });
  }

  const otp = generateOtp();

  try {
    await query(`INSERT INTO visitor_otp_requests (email, mobile, otp_code, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`, [
      email,
      mobile,
      otp,
      OTP_TTL_MINUTES,
    ]);

    const { delivered } = await sendOtpEmail(email, otp);

    const exposeOtp = process.env.NODE_ENV !== "production" || process.env.DEV_EXPOSE_OTP === "true";

    return Response.json({
      success: true,
      message: delivered ? "OTP sent successfully via Email." : "OTP generated (email delivery not configured - check server logs).",
      ...(exposeOtp ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("send-otp failed:", error);
    return Response.json({ success: false, message: "Could not send OTP. Please try again." }, { status: 500 });
  }
}
