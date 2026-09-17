import { query } from "@/lib/db";
import { tierKeyFromBadgeId, BADGE_THEME_COLOR } from "@/lib/badges";

export const metadata = {
  title: "Badge Check-in - Convergence India",
  robots: "noindex, nofollow",
};

async function lookupAndCheckIn(badgeId) {
  const tierKey = tierKeyFromBadgeId(badgeId);
  if (!tierKey) return null;

  if (tierKey === "visitor") {
    const [row] = await query(
      `SELECT id, title, first_name AS firstName, last_name AS lastName, organisation, checked_in_at AS checkedInAt
         FROM visitor_registrations WHERE badge_id = ?`,
      [badgeId]
    );
    if (!row) return null;
    const alreadyCheckedIn = Boolean(row.checkedInAt);
    if (!alreadyCheckedIn) {
      await query(`UPDATE visitor_registrations SET checked_in_at = NOW() WHERE id = ?`, [row.id]);
    }
    return {
      name: `${row.title} ${row.firstName} ${row.lastName}`.trim(),
      organisation: row.organisation,
      passLabel: "Visitor Pass",
      alreadyCheckedIn,
      checkedInAt: row.checkedInAt || new Date().toISOString(),
    };
  }

  const [row] = await query(
    `SELECT p.id, p.title, p.first_name AS firstName, p.last_name AS lastName, p.checked_in_at AS checkedInAt,
            r.organisation, r.pass_name AS passName
       FROM delegate_registration_persons p
       JOIN delegate_registrations r ON r.id = p.registration_id
      WHERE p.badge_id = ?`,
    [badgeId]
  );
  if (!row) return null;
  const alreadyCheckedIn = Boolean(row.checkedInAt);
  if (!alreadyCheckedIn) {
    await query(`UPDATE delegate_registration_persons SET checked_in_at = NOW() WHERE id = ?`, [row.id]);
  }
  return {
    name: `${row.title} ${row.firstName} ${row.lastName}`.trim(),
    organisation: row.organisation,
    passLabel: row.passName,
    alreadyCheckedIn,
    checkedInAt: row.checkedInAt || new Date().toISOString(),
  };
}

export default async function CheckinPage({ params }) {
  const { badgeId } = await params;
  const tierKey = tierKeyFromBadgeId(badgeId);
  const tint = tierKey ? BADGE_THEME_COLOR : "#8592a3";

  let attendee = null;
  let error = "";
  try {
    attendee = await lookupAndCheckIn(badgeId);
    if (!attendee) error = "No registration found for this badge.";
  } catch (e) {
    console.error("checkin lookup failed:", e);
    error = "Something went wrong looking up this badge.";
  }

  return (
    <div className="admin-login-bg">
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <div className="card-body text-center p-4 p-sm-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 64, height: 64, background: error ? "#fdecea" : "#e3f9ef" }}
          >
            <i className={`bx ${error ? "bx-error" : "bx-check-circle"}`} style={{ fontSize: 34, color: error ? "#dc3545" : "#0ea472" }}></i>
          </div>

          {error ? (
            <>
              <h5 className="fw-bold mb-1">Badge not recognised</h5>
              <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>
                {error}
              </p>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
                Badge ID: {badgeId}
              </p>
            </>
          ) : (
            <>
              <h5 className="fw-bold mb-1">{attendee.alreadyCheckedIn ? "Already checked in" : "Checked in"}</h5>
              <p className="text-muted mb-3" style={{ fontSize: 13.5 }}>
                {new Date(attendee.checkedInAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>

              <div className="text-start p-3 rounded" style={{ background: "#f8f9fb", border: "1px solid #eceef1" }}>
                <div className="fw-bold mb-1" style={{ fontSize: 18 }}>
                  {attendee.name}
                </div>
                <div className="text-muted mb-2" style={{ fontSize: 13.5 }}>
                  {attendee.organisation}
                </div>
                <span className="badge" style={{ background: tint, color: "#fff" }}>
                  {attendee.passLabel}
                </span>
              </div>

              <p className="text-muted mt-3 mb-0" style={{ fontSize: 12 }}>
                Badge ID: {badgeId}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
