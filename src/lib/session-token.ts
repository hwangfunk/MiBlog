import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ADMIN_SESSION_COOKIE_NAME = "admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface AdminSessionPayload extends JWTPayload {
  isAdmin: true;
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is not set");
}

const encodedKey = new TextEncoder().encode(sessionSecret);

export async function signAdminSessionToken() {
  return new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedKey);
}

export async function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    if (payload.isAdmin !== true) {
      return null;
    }

    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}
