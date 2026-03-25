import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifyAdminSessionToken(token);

  if (pathname === "/admin/login") {
    if (session?.isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (session?.isAdmin) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);

  const response = NextResponse.redirect(loginUrl);
  if (token) {
    response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
