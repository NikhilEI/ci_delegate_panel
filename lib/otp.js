export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
