import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

// Sends the OTP by email when SMTP_* env vars are configured. Otherwise logs
// it to the server console so registration can still be exercised in dev.
// There is no SMS provider wired up - add one (Twilio, MSG91, etc.) in here
// if OTP-by-SMS is required.
export async function sendOtpEmail(to, otp) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[otp] SMTP not configured - OTP for ${to} is ${otp}`);
    return { delivered: false };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "no-reply@convergenceindia.org",
    to,
    subject: "Your Convergence India verification code",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
  return { delivered: true };
}
