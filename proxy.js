import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/auth";
import { hasModule, moduleForPath } from "@/lib/permissions";

// Proxy (formerly "middleware") always runs on the Node.js runtime, which is
// what lets us use jsonwebtoken here.
export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredModule = moduleForPath(pathname);
  if (requiredModule && !hasModule(session, requiredModule)) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ success: false, message: "You don't have access to this module." }, { status: 403 });
    }
    const deniedUrl = new URL("/admin", request.url);
    deniedUrl.searchParams.set("denied", requiredModule);
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
