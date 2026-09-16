// Seeds a handful of realistic-looking sample registrations so the admin
// dashboard/lists aren't empty during development. Safe to re-run - it
// always inserts fresh rows (no upsert), so run it once, or delete the rows
// again with scripts/clear-sample-data.mjs if you re-run it.
import mysql from "mysql2/promise";

const titles = ["Mr.", "Ms.", "Dr.", "Mrs."];
const designations = ["CXO / Founder / Director", "IT / Technology Professional", "Marketing / Communications", "Business Development / Sales", "Media"];
const cities = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "New Delhi", state: "Delhi" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Hyderabad", state: "Telangana" },
];
const firstNames = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Karan", "Isha", "Arjun", "Meera"];
const lastNames = ["Sharma", "Patel", "Nair", "Reddy", "Singh", "Iyer", "Gupta", "Rao", "Mehta", "Kapoor"];
const companies = ["Nimbus Retail Pvt Ltd", "BlueSky Fintech", "Orbit Logistics", "Zenith Manufacturing", "Aster Healthcare", "Vertex Media Group"];
const tracks = ["Google", "Social Media", "Referral from friend / colleague", "Emailer", "Whatsapp / SMS"];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [passTypeRows] = await connection.execute(`SELECT slug, name, price FROM pass_types WHERE is_active = 1`);
  if (passTypeRows.length === 0) {
    console.error("No pass types found - run `npm run db:seed-pass-types` first.");
    process.exit(1);
  }

  const delegateSeeds = [
    { passIndex: 0, qty: 1, status: "paid", daysBack: 9 },
    { passIndex: 1, qty: 2, status: "paid", daysBack: 6 },
    { passIndex: 2, qty: 1, status: "pending", daysBack: 4 },
    { passIndex: 0, qty: 3, status: "paid", daysBack: 2 },
    { passIndex: 1, qty: 1, status: "failed", daysBack: 1 },
    { passIndex: 2, qty: 2, status: "pending", daysBack: 0 },
  ];

  for (const seed of delegateSeeds) {
    const passType = passTypeRows[seed.passIndex % passTypeRows.length];
    const total = passType.price * seed.qty;
    const createdAt = daysAgo(seed.daysBack);
    const location = pick(cities);
    const company = pick(companies);

    const [result] = await connection.execute(
      `INSERT INTO delegate_registrations
        (pass_name, price_per_delegate, quantity, total_amount, organisation, address, city, state, country, zipcode,
         gst_number, track_of_interest, terms_accepted, payment_status, razorpay_order_id, razorpay_payment_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      [
        passType.name,
        passType.price,
        seed.qty,
        total,
        company,
        `${Math.floor(Math.random() * 900) + 100}, MG Road`,
        location.city,
        location.state,
        String(Math.floor(Math.random() * 900000) + 100000),
        Math.random() > 0.5 ? `27ABCDE${Math.floor(Math.random() * 9000) + 1000}F1Z5` : null,
        pick(tracks),
        seed.status,
        `order_seed_${Math.random().toString(36).slice(2, 12)}`,
        seed.status === "paid" ? `pay_seed_${Math.random().toString(36).slice(2, 12)}` : null,
        createdAt,
        createdAt,
      ]
    );
    const registrationId = result.insertId;

    for (let i = 0; i < seed.qty; i += 1) {
      const first = pick(firstNames);
      const last = pick(lastNames);
      await connection.execute(
        `INSERT INTO delegate_registration_persons (registration_id, position, title, first_name, last_name, designation, email, mobile)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          registrationId,
          i + 1,
          pick(titles),
          first,
          last,
          pick(designations),
          `${first.toLowerCase()}.${last.toLowerCase()}${registrationId}${i}@example.com`,
          `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        ]
      );
    }
    console.log(`Seeded delegate registration #${registrationId}: ${seed.qty} x ${passType.name} (${seed.status})`);
  }

  const visitorSeeds = [
    { daysBack: 8 },
    { daysBack: 5 },
    { daysBack: 3 },
    { daysBack: 1 },
  ];

  for (const seed of visitorSeeds) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const location = pick(cities);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${Math.floor(Math.random() * 10000)}@example.com`;
    const mobile = `9${Math.floor(Math.random() * 900000000) + 100000000}`;
    const createdAt = daysAgo(seed.daysBack);

    await connection.execute(
      `INSERT INTO visitor_registrations
        (title, first_name, last_name, organisation, designation, department, country, country_code, state, city, mobile, email,
         objective_of_visit, product_interests, terms_accepted, marketing_consent, email_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'India', '91', ?, ?, ?, ?, ?, ?, 1, 1, 1, ?)`,
      [
        pick(titles),
        first,
        last,
        pick(companies),
        pick(designations),
        "Procurement",
        location.state,
        location.city,
        mobile,
        email,
        "Explore New Tech & Solutions",
        JSON.stringify({ Objective_of_Participation6: true, Objective_of_Participation3: true }),
        createdAt,
      ]
    );
    console.log(`Seeded visitor registration: ${first} ${last}`);
  }

  await connection.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
