import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const pageSize = 20;
  const search = searchParams.get("search")?.trim() || "";

  const where = [];
  const params = [];
  if (search) {
    where.push("(CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ? OR mobile LIKE ? OR organisation LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM visitor_registrations ${whereClause}`, params);

    const rows = await query(
      `SELECT id, title, first_name AS firstName, last_name AS lastName, organisation, designation,
              email, mobile, country, city, objective_of_visit AS objectiveOfVisit, created_at AS createdAt
         FROM visitor_registrations
         ${whereClause}
        ORDER BY id DESC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return Response.json({ success: true, rows, total, page, pageSize });
  } catch (error) {
    console.error("admin visitors list failed:", error);
    return Response.json({ success: false, message: "Could not load visitors." }, { status: 500 });
  }
}
