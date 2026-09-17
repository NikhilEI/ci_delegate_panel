import { query } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const companyId = Number(id);

  try {
    const [company] = await query(
      `SELECT id, name, address, city, state, country, zipcode, gst_number AS gstNumber FROM companies WHERE id = ?`,
      [companyId]
    );
    if (!company) return Response.json({ success: false, message: "Company not found." }, { status: 404 });

    const delegates = await query(
      `SELECT p.id, p.title, p.first_name AS firstName, p.last_name AS lastName, p.designation, p.email, p.mobile,
              p.badge_id AS badgeId, p.checked_in_at AS checkedInAt,
              r.id AS registrationId, r.pass_name AS passName, r.payment_status AS paymentStatus, r.created_at AS createdAt
         FROM delegate_registration_persons p
         JOIN delegate_registrations r ON r.id = p.registration_id
        WHERE r.company_id = ?
        ORDER BY p.id DESC`,
      [companyId]
    );

    const visitors = await query(
      `SELECT id, title, first_name AS firstName, last_name AS lastName, designation, email, mobile,
              badge_id AS badgeId, checked_in_at AS checkedInAt, created_at AS createdAt
         FROM visitor_registrations
        WHERE company_id = ?
        ORDER BY id DESC`,
      [companyId]
    );

    return Response.json({ success: true, company, delegates, visitors });
  } catch (error) {
    console.error("admin company detail failed:", error);
    return Response.json({ success: false, message: "Could not load company detail." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const companyId = Number(id);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body?.name || "").trim();
  if (!name) return Response.json({ success: false, message: "Company name is required." }, { status: 400 });

  try {
    const [clash] = await query(`SELECT id FROM companies WHERE name = ? AND id <> ?`, [name, companyId]);
    if (clash) return Response.json({ success: false, message: "Another company already uses that name." }, { status: 409 });

    await query(
      `UPDATE companies SET name = ?, address = ?, city = ?, state = ?, country = ?, zipcode = ?, gst_number = ? WHERE id = ?`,
      [name, body.address || null, body.city || null, body.state || null, body.country || null, body.zipcode || null, body.gstNumber || null, companyId]
    );

    // Keep the denormalized organisation text (still used by the
    // registrations/visitors lists, dashboard, and badges) in sync so
    // renaming a company here doesn't leave stale text elsewhere.
    await query(`UPDATE delegate_registrations SET organisation = ? WHERE company_id = ?`, [name, companyId]);
    await query(`UPDATE visitor_registrations SET organisation = ? WHERE company_id = ?`, [name, companyId]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("admin company update failed:", error);
    return Response.json({ success: false, message: "Could not update company." }, { status: 500 });
  }
}
