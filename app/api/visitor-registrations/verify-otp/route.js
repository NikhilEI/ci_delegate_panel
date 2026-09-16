import { query } from "@/lib/db";
import { OTP_MAX_ATTEMPTS } from "@/lib/otp";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body?.email || "").trim();
  const mobile = (body?.mobile || "").trim();
  const otp = (body?.otp || "").trim();

  if (!email || !mobile || !otp) {
    return Response.json({ success: false, message: "Missing email, mobile or OTP." }, { status: 400 });
  }

  try {
    const rows = await query(
      `SELECT id, otp_code, attempts, expires_at < NOW() AS is_expired
         FROM visitor_otp_requests
        WHERE email = ? AND mobile = ? AND verified = 0
        ORDER BY id DESC
        LIMIT 1`,
      [email, mobile]
    );

    const otpRequest = rows[0];
    if (!otpRequest) {
      return Response.json({ success: false, message: "No OTP request found. Please send a new OTP." }, { status: 400 });
    }

    if (otpRequest.attempts >= OTP_MAX_ATTEMPTS) {
      return Response.json({ success: false, message: "Too many attempts. Please request a new OTP." }, { status: 429 });
    }

    if (otpRequest.is_expired) {
      return Response.json({ success: false, message: "This OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (otpRequest.otp_code !== otp) {
      await query(`UPDATE visitor_otp_requests SET attempts = attempts + 1 WHERE id = ?`, [otpRequest.id]);
      return Response.json({ success: false, message: "Incorrect OTP." }, { status: 400 });
    }

    await query(`UPDATE visitor_otp_requests SET verified = 1 WHERE id = ?`, [otpRequest.id]);

    return Response.json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("verify-otp failed:", error);
    return Response.json({ success: false, message: "Could not verify OTP. Please try again." }, { status: 500 });
  }
}
