// One-time / idempotent seed for the pass_types catalog.
// Run with:  node --env-file=.env.local scripts/seed-pass-types.js
import mysql from "mysql2/promise";

// Matches convergenceindia.org/register-now/ - every tier's card lists the
// SAME full set of perks (a comparison view); a perk a given tier doesn't
// get is still listed, just wrapped in "~~like this~~" so PassCard renders
// it struck-through/greyed instead of leaving it out. The first 8 stay
// visible by default; the rest sit behind "View all features +".
const sharedBaseFeatures = [
  "Access to the exhibition area",
  "Fast-track registration",
  "Delegate kit",
  "Access to all conference tracks & stages",
  "Lunch in the dining area",
  "Access to the evening awards ceremony",
  "Pre-event matchmaking via Expo mobile app",
  "Post-event access to on-demand session recordings",
];

const platinumMoreFeatures = [
  "Priority seating at conference sessions",
  "Access to the networking night",
  "Access to the business networking lounge",
  "Certificate of attendance",
  "Exclusive access to the VIP lounge",
  "Exclusive car parking pass",
  "Access to plenary sessions",
  "Invitation to the inauguration ceremony",
  "Dedicated concierge support/ Guided tour of the venue",
  "Exclusive video feature on expo social media channels (subject to availability)",
];

const goldMoreFeatures = [
  "Priority seating at conference sessions",
  "Access to the networking night",
  "Access to the business networking lounge",
  "Certificate of attendance",
  "~~Exclusive access to the VIP lounge~~",
  "~~Exclusive car parking pass~~",
  "~~Access to plenary sessions~~",
  "~~Invitation to the inauguration ceremony~~",
  "~~Dedicated concierge support/ Guided tour of the venue~~",
  "~~Exclusive video feature on expo social media channels (subject to availability)~~",
];

const silverMoreFeatures = platinumMoreFeatures.map((feature) => `~~${feature}~~`);

// The free Visitor Pass is part of the same editable catalog now (managed
// from /admin/pass-types) - DelegatePasses.js special-cases badgeClass
// "delegate-pass-visitor" to show "Free" / "Register Now" / link to
// /visitor-registration instead of the paid checkout flow. Price/slug are
// mostly bookkeeping since visitor-registrations doesn't consult this row.
const visitorBaseFeatures = [
  "Entry to exhibition area",
  "Access to leading technology brands",
  "Networking opportunities with industry professionals",
  "Pre-event matchmaking via Expo mobile app",
  "~~Delegate kit~~",
  "~~Access to all conference tracks & stages~~",
  "~~Lunch in the dining area~~",
  "~~Access to the evening awards ceremony~~",
];
const visitorMoreFeatures = [
  "~~Pre-event matchmaking via Expo mobile app~~",
  "~~Post-event access to on-demand session recordings~~",
  "~~Priority seating at conference sessions~~",
  "~~Access to the networking night~~",
  "~~Access to the business networking lounge~~",
  "~~Certificate of attendance~~",
  "~~Exclusive access to the VIP lounge~~",
  "~~Exclusive car parking pass~~",
  "~~Access to plenary sessions~~",
  "~~Invitation to the inauguration ceremony~~",
  "~~Dedicated concierge support/ Guided tour of the venue~~",
  "~~Exclusive video feature on expo social media channels (subject to availability)~~",
];

const passTypes = [
  {
    slug: "platinum-delegate-passes",
    name: "Platinum Delegate Pass",
    price: 20000,
    badgeClass: "delegate-pass-platinum",
    baseFeatures: sharedBaseFeatures,
    moreFeatures: platinumMoreFeatures,
    sortOrder: 1,
  },
  {
    slug: "gold-delegate-passes",
    name: "Gold Delegate Pass",
    price: 15000,
    badgeClass: "delegate-pass-gold",
    baseFeatures: sharedBaseFeatures,
    moreFeatures: goldMoreFeatures,
    sortOrder: 2,
  },
  {
    slug: "silver-delegate-passes",
    name: "Silver Delegate Pass",
    price: 10000,
    badgeClass: "delegate-pass-silver",
    baseFeatures: sharedBaseFeatures,
    moreFeatures: silverMoreFeatures,
    sortOrder: 3,
  },
  {
    slug: "visitor-pass",
    name: "Visitor Pass",
    price: 0,
    badgeClass: "delegate-pass-visitor",
    baseFeatures: visitorBaseFeatures,
    moreFeatures: visitorMoreFeatures,
    sortOrder: 4,
  },
];

async function main() {
  const pool = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  for (const pass of passTypes) {
    await pool.execute(
      `INSERT INTO pass_types (slug, name, price, badge_class, base_features, more_features, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), price = VALUES(price), badge_class = VALUES(badge_class),
         base_features = VALUES(base_features), more_features = VALUES(more_features), sort_order = VALUES(sort_order)`,
      [pass.slug, pass.name, pass.price, pass.badgeClass, JSON.stringify(pass.baseFeatures), JSON.stringify(pass.moreFeatures), pass.sortOrder]
    );
    console.log(`Seeded pass type: ${pass.slug}`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
