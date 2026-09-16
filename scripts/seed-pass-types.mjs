// One-time / idempotent seed for the pass_types catalog.
// Run with:  node --env-file=.env.local scripts/seed-pass-types.js
import mysql from "mysql2/promise";

const passTypes = [
  {
    slug: "platinum-delegate-passes",
    name: "Platinum Delegate Pass",
    price: 20000,
    badgeClass: "delegate-pass-platinum",
    baseFeatures: [
      "Access to the exhibition area",
      "Fast-track registration",
      "Delegate kit",
      "Invitation to the inauguration ceremony",
      "Access to plenary sessions",
      "Access to all conference tracks & stages",
      "Priority seating at conference sessions",
      "Dedicated concierge support/ Guided tour of the venue",
    ],
    moreFeatures: [
      "Access to the evening awards ceremony",
      "Access to the networking night",
      "Lunch in the dining area",
      "Access to the networking lounge",
      "Exclusive access to the VIP lounge",
      "Exclusive car parking pass",
      "Pre-event matchmaking via the Expo mobile app",
      "Exclusive video feature on expo social media channels (subject to availability)",
      "Post-event access to on-demand session recordings",
      "Certificate of attendance",
    ],
    sortOrder: 1,
  },
  {
    slug: "gold-delegate-passes",
    name: "Gold Delegate Pass",
    price: 15000,
    badgeClass: "delegate-pass-gold",
    baseFeatures: [
      "Access to the exhibition area",
      "Fast-track registration",
      "Delegate kit",
      "Access to all conference tracks",
      "Priority seating at conference sessions",
      "Access to the networking night",
      "Access to the business networking lounge",
      "Access to the evening awards ceremony",
      "Pre-event matchmaking via the Expo mobile app",
    ],
    moreFeatures: [
      "Lunch in the dining area",
      "Post-event access to on-demand session recordings",
      "Priority Venue Registration",
      "Access to the networking lounge",
      "Exclusive access to the VIP lounge",
      "Exclusive car parking pass",
      "Exclusive video feature on expo social media channels (subject to availability)",
      "Certificate of attendance",
    ],
    sortOrder: 2,
  },
  {
    slug: "silver-delegate-passes",
    name: "Silver Delegate Pass",
    price: 10000,
    badgeClass: "delegate-pass-silver",
    baseFeatures: ["Access to the exhibition area", "Fast-track registration", "Delegate kit", "Invitation to the inauguration ceremony", "Access to plenary sessions"],
    moreFeatures: ["Access to all conference tracks & stages", "Priority seating at conference sessions", "Dedicated concierge support/ Guided tour of the venue"],
    sortOrder: 3,
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
