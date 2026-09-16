import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signAdminSession, ADMIN_COOKIE_NAME } from "@/lib/auth";

const emailPattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";

  if (!email || !emailPattern.test(email)) {
    return Response.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (!password) {
    return Response.json({ success: false, message: "Password is required." }, { status: 400 });
  }

  try {
    const rows = await query(`SELECT id, name, email, password_hash FROM admins WHERE email = ? LIMIT 1`, [email]);
    const admin = rows[0];

    // Always run bcrypt.compare (even against a dummy hash) so a missing
    // account doesn't respond measurably faster than a wrong password.
    const passwordMatches = admin ? await bcrypt.compare(password, admin.password_hash) : await bcrypt.compare(password, "$2a$10$invalidsaltinvalidsaltin");

    if (!admin || !passwordMatches) {
      return Response.json({ success: false, message: "Incorrect email or password." }, { status: 401 });
    }

    const token = signAdminSession(admin);
    const response = Response.json({ success: true, admin: { name: admin.name, email: admin.email } });
    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );
    return response;
  } catch (error) {
    console.error("admin login failed:", error);
    return Response.json({ success: false, message: "Could not log in. Please try again." }, { status: 500 });
  }
}
