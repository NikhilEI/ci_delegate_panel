import { query } from "@/lib/db";
import HeaderVisitor from "@/components/HeaderVisitor";
import FooterVisitor from "@/components/FooterVisitor";

export const metadata = {
  title: "Your Visitor Badge - Convergence India",
  robots: "noindex, nofollow",
};

async function getVisitorByBadgeId(badgeId) {
  if (!badgeId) return null;
  const [row] = await query(
    `SELECT title, first_name AS firstName, last_name AS lastName, organisation, badge_id AS badgeId
       FROM visitor_registrations WHERE badge_id = ? LIMIT 1`,
    [badgeId]
  );
  return row || null;
}

export default async function VisitorBadgePage({ searchParams }) {
  const params = await searchParams;
  const badgeId = (params?.id || "").trim();
  const visitor = await getVisitorByBadgeId(badgeId);

  return (
    <>
      <HeaderVisitor />
      <section className="section-padding-inner">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              {!visitor ? (
                <div className="exhibitor-profile-form-main" style={{ padding: 40 }}>
                  <h2 className="exhibitor-profile-left-heading mb-3">Badge not found</h2>
                  <p>
                    We couldn&apos;t find a badge for this link. If you just registered, check the email link again, or{" "}
                    <a href="/visitor-registration">register as a visitor</a> if you haven&apos;t yet.
                  </p>
                </div>
              ) : (
                <div className="exhibitor-profile-form-main" style={{ padding: 40 }}>
                  <h2 className="exhibitor-profile-left-heading mb-2">
                    Your badge is ready, {visitor.firstName}!
                  </h2>
                  <p className="mb-4">Save or screenshot this badge and bring it to the venue - scanning the QR checks you in at the gate.</p>

                  <img
                    src={`/badges/${visitor.badgeId}.png`}
                    alt={`Visitor badge for ${visitor.firstName} ${visitor.lastName}`}
                    style={{ width: "100%", maxWidth: 360, borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
                  />

                  <div className="mt-4">
                    <a href={`/badges/${visitor.badgeId}.png`} download className="home-book-btn-brochure">
                      Download Badge
                    </a>
                  </div>

                  <p className="text-muted mt-4" style={{ fontSize: 13 }}>
                    Badge ID: {visitor.badgeId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <FooterVisitor />
    </>
  );
}
