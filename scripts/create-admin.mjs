// Creates (or updates the password of) a named admin account.
// Run with:
//   node --env-file=.env.local scripts/create-admin.mjs "Full Name" "email@example.com" "password"
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs "Full Name" "email@example.com" "password"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const passwordHash = await bcrypt.hash(password, 10);

  await connection.execute(
    `INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
    [name, email.toLowerCase(), passwordHash]
  );

  console.log(`Admin account ready: ${email}`);
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
