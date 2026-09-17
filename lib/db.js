import mysql from "mysql2/promise";

// Next.js dev mode re-evaluates this module on most edits (Fast Refresh /
// route recompilation). Without caching the pool on `globalThis`, each
// reload would open a fresh pool and leak the old one's connections until
// MySQL's own timeout closes them - a common way to hit "too many
// connections" during active development. Production runs this module once
// per process, so the cache is a no-op there but harmless.
const globalForPool = globalThis;

export function getPool() {
  if (!globalForPool.__mysqlPool) {
    globalForPool.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      maxIdle: 10,
      idleTimeout: 60_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      dateStrings: true,
    });
  }
  return globalForPool.__mysqlPool;
}

export async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// A JSON-typed column comes back differently depending on the server: real
// MySQL has a native JSON type and mysql2 auto-parses it into a JS value
// already, while MariaDB stores JSON as plain LONGTEXT and hands back the
// raw string. Calling JSON.parse() unconditionally works on MariaDB (dev)
// but throws on MySQL (production) once the value's already an object/array -
// this normalizes both so callers never have to care which server it is.
export function parseJsonColumn(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === "string") return JSON.parse(value);
  return value;
}
