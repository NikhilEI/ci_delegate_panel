import { query } from "@/lib/db";
import { getAdminSession } from "@/lib/getAdminSession";

const validStatuses = ["pending", "paid", "failed"];

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const registrations = await query(
      `SELECT id, pass_name AS passName, price_per_delegate AS pricePerDelegate, quantity, total_amount AS totalAmount,
              organisation, address, city, state, country, zipcode, gst_number AS gstNumber, track_of_interest AS trackOfInterest,
              promo_code AS promoCode, discount_amount AS discountAmount,
              payment_status AS paymentStatus, razorpay_order_id AS razorpayOrderId, razorpay_payment_id AS razorpayPaymentId,
              payment_notes AS paymentNotes, payment_updated_at AS paymentUpdatedAt, created_at AS createdAt
         FROM delegate_registrations WHERE id = ? LIMIT 1`,
      [id]
    );
    const registration = registrations[0];
    if (!registration) {
      return Response.json({ success: false, message: "Registration not found." }, { status: 404 });
    }

    const persons = await query(
      `SELECT position, title, first_name AS firstName, last_name AS lastName, designation, email, mobile
         FROM delegate_registration_persons
        WHERE registration_id = ?
        ORDER BY position`,
      [id]
    );

    return Response.json({ success: true, registration, persons });
  } catch (error) {
    console.error("admin registration detail failed:", error);
    return Response.json({ success: false, message: "Could not load registration." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { paymentStatus, paymentNotes } = body || {};
  if (!validStatuses.includes(paymentStatus)) {
    return Response.json({ success: false, message: "Invalid payment status." }, { status: 400 });
  }

  try {
    const session = await getAdminSession();
    const result = await query(
      `UPDATE delegate_registrations
          SET payment_status = ?, payment_notes = ?, payment_updated_by = ?, payment_updated_at = NOW()
        WHERE id = ?`,
      [paymentStatus, paymentNotes || null, session?.sub || null, id]
    );

    if (result.affectedRows === 0) {
      return Response.json({ success: false, message: "Registration not found." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("admin registration update failed:", error);
    return Response.json({ success: false, message: "Could not update registration." }, { status: 500 });
  }
}
