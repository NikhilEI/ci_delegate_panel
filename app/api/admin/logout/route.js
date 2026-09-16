import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set("Set-Cookie", `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return response;
}
