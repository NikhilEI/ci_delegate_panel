import { query, parseJsonColumn } from "@/lib/db";

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

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, slug, name, price, badge_class AS badgeClass, base_features AS baseFeatures, more_features AS moreFeatures,
              sort_order AS sortOrder, is_active AS isActive
         FROM pass_types
        ORDER BY sort_order, id`
    );
    // MariaDB stores JSON as LONGTEXT and hands it back as a raw string;
    // real MySQL has a native JSON type and mysql2 auto-parses it already -
    // parseJsonColumn handles either.
    const parsedRows = rows.map((row) => ({
      ...row,
      baseFeatures: parseJsonColumn(row.baseFeatures, []),
      moreFeatures: parseJsonColumn(row.moreFeatures, []),
    }));
    return Response.json({ success: true, rows: parsedRows });
  } catch (error) {
    console.error("admin pass-types list failed:", error);
    return Response.json({ success: false, message: "Could not load pass types." }, { status: 500 });
  }
}

export async function POST(request) {
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
      `INSERT INTO pass_types (slug, name, price, badge_class, base_features, more_features, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.slug,
        body.name.trim(),
        body.price,
        body.badgeClass,
        JSON.stringify(body.baseFeatures),
        JSON.stringify(body.moreFeatures),
        Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
        body.isActive === false ? 0 : 1,
      ]
    );
    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return Response.json({ success: false, message: "A pass type with this slug already exists." }, { status: 409 });
    }
    console.error("admin pass-types create failed:", error);
    return Response.json({ success: false, message: "Could not create pass type." }, { status: 500 });
  }
}
