import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

describe("session token helpers", () => {
  it("signs and verifies a valid admin token", async () => {
    vi.resetModules();
    const { signAdminSessionToken, verifyAdminSessionToken } = await import(
      "@/lib/session-token"
    );

    const token = await signAdminSessionToken();
    const payload = await verifyAdminSessionToken(token);

    expect(payload?.isAdmin).toBe(true);
    expect(typeof payload?.exp).toBe("number");
  });

  it("returns null for an invalid token", async () => {
    vi.resetModules();
    const { verifyAdminSessionToken } = await import("@/lib/session-token");

    await expect(verifyAdminSessionToken("invalid-token")).resolves.toBeNull();
  });
});
