import crypto from "node:crypto";
import { query } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { registrationId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body || {};

  if (!registrationId || !orderId || !paymentId || !signature) {
    return Response.json({ success: false, message: "Missing payment details" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("verify-payment: RAZORPAY_KEY_SECRET is not set");
    return Response.json({ success: false, message: "Payment gateway is not configured on the server." }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = expectedSignature === signature;

  try {
    if (!isValid) {
      await query(`UPDATE delegate_registrations SET payment_status = 'failed' WHERE id = ? AND razorpay_order_id = ?`, [registrationId, orderId]);
      return Response.json({ success: false, message: "Payment signature verification failed" }, { status: 400 });
    }

    // The `payment_status <> 'paid'` guard makes this idempotent - if the
    // client calls verify twice for the same order, only the first call
    // actually updates anything (and so only it bumps the promo code's
    // used_count below).
    const result = await query(
      `UPDATE delegate_registrations
         SET payment_status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?
       WHERE id = ? AND razorpay_order_id = ? AND payment_status <> 'paid'`,
      [paymentId, signature, registrationId, orderId]
    );

    if (result.affectedRows === 0) {
      const [existing] = await query(`SELECT payment_status AS paymentStatus FROM delegate_registrations WHERE id = ? AND razorpay_order_id = ?`, [registrationId, orderId]);
      if (existing?.paymentStatus === "paid") {
        return Response.json({ success: true });
      }
      return Response.json({ success: false, message: "Registration not found for this order" }, { status: 404 });
    }

    const [registration] = await query(`SELECT promo_code AS promoCode FROM delegate_registrations WHERE id = ?`, [registrationId]);
    if (registration?.promoCode) {
      await query(`UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ?`, [registration.promoCode]);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("verify-payment failed:", error);
    return Response.json({ success: false, message: "Could not verify payment. Please contact support." }, { status: 500 });
  }
}
