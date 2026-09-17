import { query } from "@/lib/db";

const PAGE_SIZE = 20;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const search = searchParams.get("search")?.trim() || "";

  const where = [];
  const params = [];
  if (search) {
    where.push("(CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ? OR mobile LIKE ? OR organisation LIKE ? OR badge_id LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM visitor_registrations ${whereClause}`, params);

    const rows = await query(
      `SELECT id, title, first_name AS firstName, last_name AS lastName, organisation, designation,
              email, mobile, country, city, objective_of_visit AS objectiveOfVisit, created_at AS createdAt,
              badge_id AS badgeId, badge_generated_at AS badgeGeneratedAt, checked_in_at AS checkedInAt
         FROM visitor_registrations
         ${whereClause}
        ORDER BY id DESC
        LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE]
    );

    return Response.json({ success: true, rows, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("admin visitors list failed:", error);
    return Response.json({ success: false, message: "Could not load visitors." }, { status: 500 });
  }
}
