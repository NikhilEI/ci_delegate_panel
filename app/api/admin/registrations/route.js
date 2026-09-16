import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const pageSize = 20;
  const status = searchParams.get("status") || "";
  const passName = searchParams.get("passName") || "";
  const search = searchParams.get("search")?.trim() || "";

  const where = [];
  const params = [];

  if (status) {
    where.push("payment_status = ?");
    params.push(status);
  }
  if (passName) {
    where.push("pass_name = ?");
    params.push(passName);
  }
  if (search) {
    where.push("(organisation LIKE ? OR id IN (SELECT registration_id FROM delegate_registration_persons WHERE email LIKE ? OR mobile LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?))");
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM delegate_registrations ${whereClause}`, params);

    const rows = await query(
      `SELECT id, pass_name AS passName, quantity, total_amount AS totalAmount, payment_status AS paymentStatus,
              organisation, created_at AS createdAt
         FROM delegate_registrations
         ${whereClause}
        ORDER BY id DESC
        LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return Response.json({ success: true, rows, total, page, pageSize });
  } catch (error) {
    console.error("admin registrations list failed:", error);
    return Response.json({ success: false, message: "Could not load registrations." }, { status: 500 });
  }
}
