import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./auth";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}
