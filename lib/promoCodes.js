import { query } from "./db";

// Looks up a promo code and checks it against a specific pass + subtotal.
// Used both by the public "apply code" endpoint (to preview the discount)
// and by the registration API (to recompute it server-side - the client's
// number is never trusted for the actual charge).
export async function checkPromoCode({ code, passTypeId, subtotal }) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) {
    return { valid: false, message: "Enter a promo code." };
  }

  const rows = await query(
    `SELECT id, code, discount_type AS discountType, discount_value AS discountValue, pass_type_id AS passTypeId,
            max_uses AS maxUses, used_count AS usedCount, valid_from AS validFrom, valid_until AS validUntil, is_active AS isActive
       FROM promo_codes
      WHERE code = ?
      LIMIT 1`,
    [normalized]
  );
  const promo = rows[0];

  if (!promo || !promo.isActive) {
    return { valid: false, message: "This promo code is not valid." };
  }
  if (promo.passTypeId && promo.passTypeId !== passTypeId) {
    return { valid: false, message: "This promo code does not apply to this pass." };
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, message: "This promo code has reached its usage limit." };
  }
  const today = new Date().toISOString().slice(0, 10);
  if (promo.validFrom && today < promo.validFrom) {
    return { valid: false, message: "This promo code is not active yet." };
  }
  if (promo.validUntil && today > promo.validUntil) {
    return { valid: false, message: "This promo code has expired." };
  }

  const discountAmount =
    promo.discountType === "percent" ? Math.round((subtotal * promo.discountValue) / 100) : Math.min(promo.discountValue, subtotal);

  return {
    valid: true,
    promoCodeId: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    message: promo.discountType === "percent" ? `${promo.discountValue}% off applied.` : `₹${promo.discountValue.toLocaleString("en-IN")} off applied.`,
  };
}
