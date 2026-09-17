import { query } from "@/lib/db";

// Companies are now a real table (see lib/companies.js - every registration
// resolves/creates its company_id at submission time), so this is a plain
// id-keyed join instead of the old GROUP BY TRIM(organisation) string match.
const PAGE_SIZE = 10;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  try {
    const where = search ? `WHERE c.name LIKE ?` : "";
    const params = search ? [`%${search}%`] : [];

    const companies = await query(
      `SELECT c.id, c.name, c.address, c.city, c.state, c.country, c.zipcode, c.gst_number AS gstNumber
         FROM companies c
         ${where}
        ORDER BY c.name ASC`,
      params
    );

    const delegateAgg = await query(
      `SELECT company_id AS companyId, COUNT(*) AS registrations, SUM(quantity) AS delegateCount,
              SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) AS revenue
         FROM delegate_registrations
        WHERE company_id IS NOT NULL
        GROUP BY company_id`
    );
    const visitorAgg = await query(
      `SELECT company_id AS companyId, COUNT(*) AS visitorCount
         FROM visitor_registrations
        WHERE company_id IS NOT NULL
        GROUP BY company_id`
    );

    const delegateById = new Map(delegateAgg.map((row) => [row.companyId, row]));
    const visitorById = new Map(visitorAgg.map((row) => [row.companyId, row]));

    const allRows = companies
      .map((company) => {
        const d = delegateById.get(company.id);
        const v = visitorById.get(company.id);
        return {
          ...company,
          registrations: d?.registrations || 0,
          delegateCount: Number(d?.delegateCount || 0),
          revenue: Number(d?.revenue || 0),
          visitorCount: v?.visitorCount || 0,
        };
      })
      .sort((a, b) => b.delegateCount + b.visitorCount - (a.delegateCount + a.visitorCount));

    const total = allRows.length;
    const rows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return Response.json({ success: true, rows, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("admin companies list failed:", error);
    return Response.json({ success: false, message: "Could not load companies." }, { status: 500 });
  }
}
