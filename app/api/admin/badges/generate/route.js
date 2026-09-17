import { query } from "@/lib/db";
import { generateBadge, tierFromPassName } from "@/lib/badges";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { kind, id } = body || {};
  if ((kind !== "visitor" && kind !== "delegate") || !Number.isInteger(id)) {
    return Response.json({ success: false, message: "kind and id are required" }, { status: 400 });
  }

  const siteOrigin = new URL(request.url).origin;

  try {
    if (kind === "visitor") {
      const [visitor] = await query(
        `SELECT id, title, first_name AS firstName, last_name AS lastName, organisation FROM visitor_registrations WHERE id = ?`,
        [id]
      );
      if (!visitor) return Response.json({ success: false, message: "Visitor not found" }, { status: 404 });

      const { badgeId, publicPath } = await generateBadge({
        tierKey: "visitor",
        numericId: visitor.id,
        name: `${visitor.title} ${visitor.firstName} ${visitor.lastName}`.trim(),
        company: visitor.organisation,
        siteOrigin,
      });

      await query(`UPDATE visitor_registrations SET badge_id = ?, badge_generated_at = NOW() WHERE id = ?`, [badgeId, id]);

      return Response.json({ success: true, badgeId, imageUrl: publicPath });
    }

    const [delegate] = await query(
      `SELECT p.id, p.title, p.first_name AS firstName, p.last_name AS lastName,
              r.organisation, r.pass_name AS passName, r.payment_status AS paymentStatus
         FROM delegate_registration_persons p
         JOIN delegate_registrations r ON r.id = p.registration_id
        WHERE p.id = ?`,
      [id]
    );
    if (!delegate) return Response.json({ success: false, message: "Delegate not found" }, { status: 404 });
    if (delegate.paymentStatus !== "paid") {
      return Response.json({ success: false, message: "This registration is not paid yet - badges are only issued for paid delegates." }, { status: 400 });
    }

    const tierKey = tierFromPassName(delegate.passName);
    if (!tierKey) return Response.json({ success: false, message: `Could not determine pass tier from "${delegate.passName}".` }, { status: 400 });

    const { badgeId, publicPath } = await generateBadge({
      tierKey,
      numericId: delegate.id,
      name: `${delegate.title} ${delegate.firstName} ${delegate.lastName}`.trim(),
      company: delegate.organisation,
      siteOrigin,
    });

    await query(`UPDATE delegate_registration_persons SET badge_id = ?, badge_generated_at = NOW() WHERE id = ?`, [badgeId, id]);

    return Response.json({ success: true, badgeId, imageUrl: publicPath });
  } catch (error) {
    console.error("badge generation failed:", error);
    return Response.json({ success: false, message: "Could not generate badge." }, { status: 500 });
  }
}
