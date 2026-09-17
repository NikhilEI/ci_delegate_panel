import { randomInt } from "node:crypto";

export function generateOtp() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += randomInt(0, 10);
  }
  return otp;
}

export const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 10;
export const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_VERIFY_ATTEMPTS) || 5;

// Anti-abuse limits enforced server-side in send-otp/route.js (the client's
// countdown timer is a courtesy UI hint only - it can't be trusted, since
// nothing stops someone from calling the API directly).
export const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 120;
export const OTP_SEND_WINDOW_MINUTES = Number(process.env.OTP_SEND_WINDOW_MINUTES) || 15;
export const OTP_MAX_SENDS = Number(process.env.OTP_MAX_SENDS) || 5;

export function requestIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
