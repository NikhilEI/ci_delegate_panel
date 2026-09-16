// Removes only the rows created by seed-sample-data.mjs (identified by the
// "order_seed_" prefix / @example.com addresses it uses), leaving any real
// registrations untouched.
import mysql from "mysql2/promise";

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [regResult] = await connection.execute(`DELETE FROM delegate_registrations WHERE razorpay_order_id LIKE 'order_seed_%'`);
  console.log(`Deleted ${regResult.affectedRows} delegate registrations (persons cascade automatically).`);

  const [visitorResult] = await connection.execute(`DELETE FROM visitor_registrations WHERE email LIKE '%@example.com'`);
  console.log(`Deleted ${visitorResult.affectedRows} visitor registrations.`);

  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
