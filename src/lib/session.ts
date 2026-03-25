import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  type AdminSessionPayload,
  signAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/session-token";

function getRequiredAdminPassword() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }

  return adminPassword;
}

function getSafeRedirectTarget(fromPath: string) {
  if (fromPath.startsWith("/") && !fromPath.startsWith("//")) {
    return fromPath;
  }

  return "/admin";
}

export async function getAdminSessionOrNull(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
}

export async function createAdminSession() {
  const token = await signAdminSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}

export async function requireAdminPageSession(fromPath = "/admin") {
  const session = await getAdminSessionOrNull();

  if (!session) {
    redirect(`/admin/login?from=${encodeURIComponent(getSafeRedirectTarget(fromPath))}`);
  }

  return session;
}

export async function requireAdminMutationSession() {
  const session = await getAdminSessionOrNull();

  if (!session) {
    return {
      ok: false as const,
      status: 401,
      error: "Unauthorized",
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export async function verifyAdminPassword(password: string) {
  const expectedPassword = getRequiredAdminPassword();
  const provided = Buffer.from(password);
  const expected = Buffer.from(expectedPassword);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}
