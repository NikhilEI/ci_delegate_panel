import bcrypt from "bcryptjs";
import { query, parseJsonColumn } from "@/lib/db";
import { ALL_MODULE_KEYS } from "@/lib/permissions";

const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

function parsePermissions(row) {
  return { ...row, permissions: parseJsonColumn(row.permissions, []) };
}

export async function GET() {
  try {
    const rows = await query(`SELECT id, name, email, role, permissions, created_at AS createdAt FROM admins ORDER BY id ASC`);
    return Response.json({ success: true, rows: rows.map(parsePermissions) });
  } catch (error) {
    console.error("admin users list failed:", error);
    return Response.json({ success: false, message: "Could not load admin users." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body?.name || "").trim();
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";
  const role = body?.role || "custom";
  const permissions = Array.isArray(body?.permissions) ? body.permissions.filter((key) => ALL_MODULE_KEYS.includes(key)) : [];

  if (!name || name.length < 2) return Response.json({ success: false, message: "Enter the admin's name." }, { status: 400 });
  if (!email || !emailPattern.test(email)) return Response.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
  if (!password || password.length < 8) return Response.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });

  try {
    const [existing] = await query(`SELECT id FROM admins WHERE email = ?`, [email]);
    if (existing) return Response.json({ success: false, message: "An admin with that email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(`INSERT INTO admins (name, email, password_hash, role, permissions) VALUES (?, ?, ?, ?, ?)`, [
      name,
      email,
      passwordHash,
      role,
      JSON.stringify(permissions),
    ]);

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("admin user creation failed:", error);
    return Response.json({ success: false, message: "Could not create admin user." }, { status: 500 });
  }
}
