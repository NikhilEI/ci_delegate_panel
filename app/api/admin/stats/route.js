import { query } from "@/lib/db";

export async function GET() {
  try {
    const [totals] = await query(
      `SELECT
         COUNT(*) AS registrationCount,
         COALESCE(SUM(quantity), 0) AS delegateCount,
         COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS revenuePaid,
         COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) AS revenuePending,
         SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paidCount,
         SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
         SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) AS failedCount
       FROM delegate_registrations`
    );

    const byPassType = await query(
      `SELECT pass_name AS passName, COUNT(*) AS registrations, COALESCE(SUM(quantity), 0) AS delegates,
              COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS revenue
         FROM delegate_registrations
        GROUP BY pass_name
        ORDER BY revenue DESC`
    );

    const [visitorTotals] = await query(`SELECT COUNT(*) AS visitorCount FROM visitor_registrations`);

    const recentRegistrations = await query(
      `SELECT id, pass_name AS passName, quantity, total_amount AS totalAmount, payment_status AS paymentStatus, created_at AS createdAt
         FROM delegate_registrations
        ORDER BY id DESC
        LIMIT 8`
    );

    const recentVisitors = await query(
      `SELECT id, first_name AS firstName, last_name AS lastName, organisation, created_at AS createdAt
         FROM visitor_registrations
        ORDER BY id DESC
        LIMIT 8`
    );

    const dailyRows = await query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS registrations,
              COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS revenue
         FROM delegate_registrations
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        GROUP BY DATE(created_at)`
    );
    const dailyByDate = new Map(dailyRows.map((row) => [String(row.day), row]));
    const timeseries = [];
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const row = dailyByDate.get(key);
      timeseries.push({ day: key, registrations: row ? Number(row.registrations) : 0, revenue: row ? Number(row.revenue) : 0 });
    }

    return Response.json({
      success: true,
      totals,
      visitorTotals,
      byPassType,
      recentRegistrations,
      recentVisitors,
      timeseries,
    });
  } catch (error) {
    console.error("admin stats failed:", error);
    return Response.json({ success: false, message: "Could not load stats." }, { status: 500 });
  }
}
