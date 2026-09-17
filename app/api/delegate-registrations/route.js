import { getPool, query } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { checkPromoCode } from "@/lib/promoCodes";
import { resolveCompanyId } from "@/lib/companies";

const titlePattern = /^.{1,10}$/;
const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

function badRequest(message) {
  return Response.json({ success: false, message }, { status: 400 });
}

function validatePayload(body) {
  const { passSlug, quantity, delegates, company, termsAccepted } = body || {};

  if (!passSlug || typeof passSlug !== "string") return "passSlug is required";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return "quantity is invalid";
  if (!Array.isArray(delegates) || delegates.length !== quantity) return "delegates must match quantity";
  if (!termsAccepted) return "Terms and Conditions must be accepted";

  for (const delegate of delegates) {
    if (!delegate.title || !titlePattern.test(delegate.title)) return "Each delegate needs a title";
    if (!delegate.firstName?.trim()) return "Each delegate needs a first name";
    if (!delegate.lastName?.trim()) return "Each delegate needs a last name";
    if (!delegate.designation?.trim()) return "Each delegate needs a designation";
    if (!delegate.email || !emailPattern.test(delegate.email)) return "Each delegate needs a valid email";
    if (!delegate.mobile || !/^[0-9]{6,15}$/.test(delegate.mobile)) return "Each delegate needs a valid mobile number";
  }

  if (!company?.organisation?.trim()) return "Organisation is required";
  if (!company?.address?.trim()) return "Address is required";
  if (!company?.city?.trim()) return "City is required";
  if (!company?.state?.trim()) return "State is required";
  if (!company?.country?.trim()) return "Country is required";
  if (!company?.zipcode?.trim()) return "Zip code is required";

  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const validationError = validatePayload(body);
  if (validationError) return badRequest(validationError);

  const { passSlug, quantity, delegates, company, promoCode } = body;

  // The pass name/price are always re-derived from the DB, never trusted
  // from the client - the query string that carries them to this page is
  // plain, user-editable text.
  const passRows = await query(`SELECT id, name, price FROM pass_types WHERE slug = ? AND is_active = 1 LIMIT 1`, [passSlug]);
  const passType = passRows[0];
  if (!passType) return badRequest("This pass is no longer available.");

  const subtotal = passType.price * quantity;

  let discountAmount = 0;
  let appliedPromoCode = null;
  if (promoCode) {
    const promoResult = await checkPromoCode({ code: promoCode, passTypeId: passType.id, subtotal });
    if (!promoResult.valid) return badRequest(promoResult.message);
    discountAmount = promoResult.discountAmount;
    appliedPromoCode = promoResult.code;
  }
  const totalAmount = subtotal - discountAmount;

  const pool = getPool();
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const runInTx = async (sql, params) => (await connection.execute(sql, params))[0];

    const companyId = await resolveCompanyId(runInTx, {
      name: company.organisation,
      address: company.address,
      city: company.city,
      state: company.state,
      country: company.country,
      zipcode: company.zipcode,
      gstNumber: company.gstNumber,
    });

    const [registrationResult] = await connection.execute(
      `INSERT INTO delegate_registrations
        (pass_name, price_per_delegate, quantity, total_amount, organisation, company_id, address, city, state, country, zipcode, gst_number, track_of_interest, promo_code, discount_amount, terms_accepted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        passType.name,
        passType.price,
        quantity,
        totalAmount,
        company.organisation,
        companyId,
        company.address,
        company.city,
        company.state,
        company.country,
        company.zipcode,
        company.gstNumber || null,
        company.trackOfInterest || null,
        appliedPromoCode,
        discountAmount,
      ]
    );
    const registrationId = registrationResult.insertId;

    for (const [index, delegate] of delegates.entries()) {
      await connection.execute(
        `INSERT INTO delegate_registration_persons
          (registration_id, position, title, first_name, last_name, designation, email, mobile)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [registrationId, index + 1, delegate.title, delegate.firstName.trim(), delegate.lastName.trim(), delegate.designation, delegate.email.trim(), delegate.mobile.trim()]
      );
    }

    const order = await getRazorpay().orders.create({
      amount: Math.max(totalAmount, 0) * 100, // paise
      currency: "INR",
      receipt: `delegate_reg_${registrationId}`,
      notes: { registrationId: String(registrationId), passName: passType.name, promoCode: appliedPromoCode || "" },
    });

    await connection.execute(`UPDATE delegate_registrations SET razorpay_order_id = ? WHERE id = ?`, [order.id, registrationId]);

    await connection.commit();

    return Response.json({
      success: true,
      registrationId,
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("delegate-registrations POST failed:", error);
    return Response.json({ success: false, message: "Could not create registration. Please try again." }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
