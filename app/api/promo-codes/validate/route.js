import { query } from "@/lib/db";
import { checkPromoCode } from "@/lib/promoCodes";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ valid: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const code = body?.code;
  const passSlug = body?.passSlug;
  const quantity = Number(body?.quantity);

  if (!code || !passSlug || !Number.isInteger(quantity) || quantity < 1) {
    return Response.json({ valid: false, message: "Missing or invalid fields." }, { status: 400 });
  }

  try {
    const passRows = await query(`SELECT id, price FROM pass_types WHERE slug = ? AND is_active = 1 LIMIT 1`, [passSlug]);
    const passType = passRows[0];
    if (!passType) {
      return Response.json({ valid: false, message: "Pass not found." }, { status: 404 });
    }

    const subtotal = passType.price * quantity;
    const result = await checkPromoCode({ code, passTypeId: passType.id, subtotal });

    if (!result.valid) {
      return Response.json(result, { status: 200 });
    }

    return Response.json({
      ...result,
      subtotal,
      total: subtotal - result.discountAmount,
    });
  } catch (error) {
    console.error("promo-codes validate failed:", error);
    return Response.json({ valid: false, message: "Could not validate promo code. Please try again." }, { status: 500 });
  }
}
