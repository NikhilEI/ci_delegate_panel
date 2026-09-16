import { query } from "@/lib/db";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validatePayload(body) {
  if (!body?.slug || !slugPattern.test(body.slug)) return "Slug must be lowercase letters, numbers and hyphens only.";
  if (!body?.name?.trim()) return "Name is required.";
  if (!Number.isInteger(body.price) || body.price < 0) return "Price must be a whole number of rupees.";
  if (!body?.badgeClass?.trim()) return "Badge style is required.";
  if (!Array.isArray(body.baseFeatures) || body.baseFeatures.length === 0) return "At least one included feature is required.";
  if (!Array.isArray(body.moreFeatures)) return "More features must be a list.";
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
      `UPDATE pass_types
          SET slug = ?, name = ?, price = ?, badge_class = ?, base_features = ?, more_features = ?, sort_order = ?, is_active = ?
        WHERE id = ?`,
      [
        body.slug,
        body.name.trim(),
        body.price,
        body.badgeClass,
        JSON.stringify(body.baseFeatures),
        JSON.stringify(body.moreFeatures),
        Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
        body.isActive === false ? 0 : 1,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return Response.json({ success: false, message: "Pass type not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json({ success: false, message: "A pass type with this slug already exists." }, { status: 409 });
    }
    console.error("admin pass-types update failed:", error);
    return Response.json({ success: false, message: "Could not update pass type." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const result = await query(`DELETE FROM pass_types WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return Response.json({ success: false, message: "Pass type not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("admin pass-types delete failed:", error);
    return Response.json({ success: false, message: "Could not delete pass type." }, { status: 500 });
  }
}
