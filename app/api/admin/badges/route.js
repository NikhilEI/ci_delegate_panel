import { query } from "@/lib/db";
import { tierFromPassName } from "@/lib/badges";

// Grouped by company (via company_id, same relational structure as
// /admin/companies) - each company's delegates and visitors sit together, so
// gate-day badge printing can be done company by company instead of hunting
// through one long flat list.
const PAGE_SIZE = 10;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const kind = searchParams.get("kind") || "all"; // all | visitor | delegate
  const status = searchParams.get("status") || "all"; // all | pending | generated | checked_in
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  function matchesStatus(row) {
    if (status === "pending") return !row.badgeId;
    if (status === "generated") return Boolean(row.badgeId) && !row.checkedInAt;
    if (status === "checked_in") return Boolean(row.checkedInAt);
    return true;
  }

  try {
    const companies = await query(`SELECT id, name FROM companies ORDER BY name ASC`);

    const delegateRows =
      kind === "visitor"
        ? []
        : await query(
            `SELECT p.id, p.title, p.first_name AS firstName, p.last_name AS lastName,
                    p.badge_id AS badgeId, p.badge_generated_at AS badgeGeneratedAt, p.checked_in_at AS checkedInAt,
                    r.company_id AS companyId, r.pass_name AS passName, r.payment_status AS paymentStatus
               FROM delegate_registration_persons p
               JOIN delegate_registrations r ON r.id = p.registration_id
              ORDER BY p.id DESC`
          );

    const visitorRows =
      kind === "delegate"
        ? []
        : await query(
            `SELECT id, title, first_name AS firstName, last_name AS lastName, company_id AS companyId,
                    badge_id AS badgeId, badge_generated_at AS badgeGeneratedAt, checked_in_at AS checkedInAt
               FROM visitor_registrations
              ORDER BY id DESC`
          );

    function toDelegateEntry(row) {
      return {
        kind: "delegate",
        id: row.id,
        name: `${row.title} ${row.firstName} ${row.lastName}`.trim(),
        passLabel: row.passName,
        tierKey: tierFromPassName(row.passName),
        eligible: row.paymentStatus === "paid",
        paymentStatus: row.paymentStatus,
        badgeId: row.badgeId,
        badgeGeneratedAt: row.badgeGeneratedAt,
        checkedInAt: row.checkedInAt,
      };
    }
    function toVisitorEntry(row) {
      return {
        kind: "visitor",
        id: row.id,
        name: `${row.title} ${row.firstName} ${row.lastName}`.trim(),
        passLabel: "Visitor Pass",
        tierKey: "visitor",
        eligible: true,
        badgeId: row.badgeId,
        badgeGeneratedAt: row.badgeGeneratedAt,
        checkedInAt: row.checkedInAt,
      };
    }

    // Two passes per type: status-filtered only ("all"), and status+search
    // filtered ("matched") - a company whose own name matches the search
    // shows all of its attendees; a company that only has an individually
    // matching attendee shows just that attendee.
    function groupByCompany(rows, toEntry, { applySearch }) {
      const byCompany = new Map();
      for (const row of rows) {
        const entry = toEntry(row);
        if (!matchesStatus(entry)) continue;
        if (applySearch && search && !`${entry.name} ${entry.badgeId || ""}`.toLowerCase().includes(search)) continue;
        if (!byCompany.has(row.companyId)) byCompany.set(row.companyId, []);
        byCompany.get(row.companyId).push(entry);
      }
      return byCompany;
    }

    const allDelegates = groupByCompany(delegateRows, toDelegateEntry, { applySearch: false });
    const allVisitors = groupByCompany(visitorRows, toVisitorEntry, { applySearch: false });
    const matchedDelegates = groupByCompany(delegateRows, toDelegateEntry, { applySearch: true });
    const matchedVisitors = groupByCompany(visitorRows, toVisitorEntry, { applySearch: true });

    const grouped = companies
      .map((company) => {
        const companyNameMatches = !search || company.name.toLowerCase().includes(search);
        const delegates = (companyNameMatches ? allDelegates : matchedDelegates).get(company.id) || [];
        const visitors = (companyNameMatches ? allVisitors : matchedVisitors).get(company.id) || [];
        return { id: company.id, name: company.name, delegates, visitors };
      })
      .filter((company) => company.delegates.length > 0 || company.visitors.length > 0);

    const total = grouped.length;
    const paged = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return Response.json({ success: true, companies: paged, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("admin badges list failed:", error);
    return Response.json({ success: false, message: "Could not load attendees." }, { status: 500 });
  }
}
