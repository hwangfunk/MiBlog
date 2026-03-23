import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

async function decryptSession(session: string | undefined) {
  if (!session || !encodedKey) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { isAdmin: boolean; expiresAt: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow the login page
  if (path === "/admin/login") {
    // If already authenticated, redirect to admin
    const session = request.cookies.get("admin-session")?.value;
    const payload = await decryptSession(session);
    if (payload?.isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Check for valid session cookie on all /admin routes
  const session = request.cookies.get("admin-session")?.value;
  const payload = await decryptSession(session);

  if (!payload?.isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
