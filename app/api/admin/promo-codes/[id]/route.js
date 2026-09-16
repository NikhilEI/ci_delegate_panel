import { query } from "@/lib/db";

const codePattern = /^[A-Z0-9_-]{3,30}$/;

function validatePayload(body) {
  if (!body?.code || !codePattern.test(String(body.code).trim().toUpperCase())) {
    return "Code must be 3-30 characters: letters, numbers, hyphens or underscores.";
  }
  if (!["percent", "fixed"].includes(body?.discountType)) return "Choose a discount type.";
  if (!Number.isInteger(body?.discountValue) || body.discountValue <= 0) return "Discount value must be a positive whole number.";
  if (body.discountType === "percent" && body.discountValue > 100) return "Percent discount cannot exceed 100.";
  if (body.maxUses !== null && (!Number.isInteger(body.maxUses) || body.maxUses < 1)) return "Max uses must be a positive whole number, or left blank for unlimited.";
  if (body.validFrom && body.validUntil && body.validFrom > body.validUntil) return "Valid-from date must be before valid-until date.";
  return null;
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validatePayload(body);
  if (validationError) return Response.json({ success: false, message: validationError }, { status: 400 });

  try {
    const result = await query(
      `UPDATE promo_codes
          SET code = ?, discount_type = ?, discount_value = ?, pass_type_id = ?, max_uses = ?, valid_from = ?, valid_until = ?, is_active = ?
        WHERE id = ?`,
      [
        String(body.code).trim().toUpperCase(),
        body.discountType,
        body.discountValue,
        body.passTypeId || null,
        body.maxUses || null,
        body.validFrom || null,
        body.validUntil || null,
        body.isActive === false ? 0 : 1,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return Response.json({ success: false, message: "Promo code not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json({ success: false, message: "A promo code with this code already exists." }, { status: 409 });
    }
    console.error("admin promo-codes update failed:", error);
    return Response.json({ success: false, message: "Could not update promo code." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const result = await query(`DELETE FROM promo_codes WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return Response.json({ success: false, message: "Promo code not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("admin promo-codes delete failed:", error);
    return Response.json({ success: false, message: "Could not delete promo code." }, { status: 500 });
  }
}
