"use server";

import { redirect } from "next/navigation";
import { logAdminAuditEvent } from "@/lib/admin-audit";
import {
  clearAdminLoginAttempts,
  getAdminLoginRateLimit,
  registerFailedAdminLoginAttempt,
} from "@/lib/admin-rate-limit";
import { getActionRequestContext } from "@/lib/admin-request";
import {
  clearAdminSession,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/session";

export interface LoginActionState {
  error: string | null;
  lockedUntil: string | null;
  requestId: string | null;
}

function getSafeRedirectTarget(fromPath: string) {
  if (fromPath.startsWith("/") && !fromPath.startsWith("//")) {
    return fromPath;
  }

  return "/admin";
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const requestContext = await getActionRequestContext();
  const password = String(formData.get("password") ?? "");
  const from = getSafeRedirectTarget(String(formData.get("from") ?? "/admin"));

  if (!password.trim()) {
    return {
      error: "Please enter the admin password.",
      lockedUntil: null,
      requestId: requestContext.correlationId,
    };
  }

  const rateLimit = await getAdminLoginRateLimit(requestContext.fingerprint);

  if (rateLimit.blockedUntil) {
    await logAdminAuditEvent({
      eventType: "admin.login.blocked",
      success: false,
      requestContext,
      metadata: {
        from,
        blockedUntil: rateLimit.blockedUntil,
      },
    });

    return {
      error: "Too many failed attempts. Try again later.",
      lockedUntil: rateLimit.blockedUntil,
      requestId: requestContext.correlationId,
    };
  }

  const isValidPassword = await verifyAdminPassword(password);

  if (!isValidPassword) {
    const failedAttempt = await registerFailedAdminLoginAttempt(requestContext.fingerprint);

    await logAdminAuditEvent({
      eventType: "admin.login.failed",
      success: false,
      requestContext,
      metadata: {
        from,
        blockedUntil: failedAttempt.blockedUntil,
        remainingAttempts: failedAttempt.remainingAttempts,
      },
    });

    return {
      error: failedAttempt.blockedUntil
        ? "Too many failed attempts. Try again later."
        : "Invalid credentials.",
      lockedUntil: failedAttempt.blockedUntil,
      requestId: requestContext.correlationId,
    };
  }

  await clearAdminLoginAttempts(requestContext.fingerprint);
  await createAdminSession();
  await logAdminAuditEvent({
    eventType: "admin.login.succeeded",
    success: true,
    requestContext,
    metadata: { from },
  });

  redirect(from);
}

export async function logoutAction() {
  const requestContext = await getActionRequestContext();
  await clearAdminSession();
  await logAdminAuditEvent({
    eventType: "admin.logout",
    success: true,
    requestContext,
  });
  redirect("/");
}
