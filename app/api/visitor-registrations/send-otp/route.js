import { query } from "@/lib/db";
import { sendOtpSms, smsGatewayConfigured } from "@/lib/sms";
import { generateOtp, OTP_TTL_MINUTES, OTP_RESEND_COOLDOWN_SECONDS, OTP_SEND_WINDOW_MINUTES, OTP_MAX_SENDS, requestIp } from "@/lib/otp";

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
  const countryCode = (body?.countryCode || "91").replace(/[^0-9]/g, "");

  if (!email || !emailPattern.test(email)) {
    return Response.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (!mobile || !/^[0-9]{6,15}$/.test(mobile)) {
    return Response.json({ success: false, message: "Enter a valid mobile number." }, { status: 400 });
  }

  const ip = requestIp(request);

  try {
    // Resend cooldown - the frontend's countdown timer is only a UI hint;
    // this is the real enforcement (anyone can call this route directly).
    const [lastRequest] = await query(
      `SELECT created_at, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS secondsAgo
         FROM visitor_otp_requests
        WHERE email = ? AND mobile = ?
        ORDER BY id DESC
        LIMIT 1`,
      [email, mobile]
    );
    if (lastRequest && lastRequest.secondsAgo < OTP_RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = OTP_RESEND_COOLDOWN_SECONDS - lastRequest.secondsAgo;
      return Response.json(
        { success: false, message: `Please wait ${waitSeconds} seconds before requesting another OTP.`, waitSeconds },
        { status: 429 }
      );
    }

    // Rolling-window quota, checked per identifier and per IP so neither a
    // single email/mobile pair nor a single sender can be used to flood
    // the mail queue.
    const [{ identifierCount }] = await query(
      `SELECT COUNT(*) AS identifierCount FROM visitor_otp_requests
        WHERE email = ? AND mobile = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [email, mobile, OTP_SEND_WINDOW_MINUTES]
    );
    const [{ ipCount }] = await query(
      `SELECT COUNT(*) AS ipCount FROM visitor_otp_requests
        WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [ip, OTP_SEND_WINDOW_MINUTES]
    );
    if (identifierCount >= OTP_MAX_SENDS || ipCount >= OTP_MAX_SENDS) {
      return Response.json({ success: false, message: "Too many OTP requests. Please try again later." }, { status: 429 });
    }

    const otp = generateOtp();

    await query(
      `INSERT INTO visitor_otp_requests (email, mobile, ip_address, otp_code, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [email, mobile, ip, otp, OTP_TTL_MINUTES]
    );

    // Mobile is the only OTP delivery channel - email is collected on the
    // form but never used for OTP delivery. A gateway failure is a real
    // error: there's no other channel for the visitor to fall back to.
    let smsSent = false;
    if (smsGatewayConfigured()) {
      try {
        // send2.digital rejects a leading "+" with error 111 "Invalid
        // number" - it wants plain digits (country code + number).
        await sendOtpSms(`${countryCode}${mobile}`, otp);
        smsSent = true;
      } catch (smsError) {
        console.error("send-otp SMS failed:", smsError);
        return Response.json({ success: false, message: "Could not send OTP right now. Please try again." }, { status: 502 });
      }
    }

    // DEV_EXPOSE_OTP is the explicit override once it's set at all - an
    // explicit "false" must win even in dev mode (previously it didn't,
    // since NODE_ENV !== "production" is true for every `npm run dev` run
    // regardless of this flag). Only fall back to the NODE_ENV-based default
    // when the flag is entirely unset.
    const devExposeSetting = process.env.DEV_EXPOSE_OTP;
    const exposeOtp = devExposeSetting === "true" || (devExposeSetting === undefined && process.env.NODE_ENV !== "production");

    const message = smsSent ? "OTP sent successfully via SMS." : "OTP generated (SMS gateway not configured - check server logs).";

    return Response.json({
      success: true,
      message,
      ...(exposeOtp ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("send-otp failed:", error);
    return Response.json({ success: false, message: "Could not send OTP. Please try again." }, { status: 500 });
  }
}
