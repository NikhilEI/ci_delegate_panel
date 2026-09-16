import jwt from "jsonwebtoken";

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL = "7d";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local.");
  }
  return secret;
}

export function signAdminSession(admin) {
  return jwt.sign({ sub: admin.id, name: admin.name, email: admin.email }, getSecret(), { expiresIn: SESSION_TTL });
}

export function verifyAdminSession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}
