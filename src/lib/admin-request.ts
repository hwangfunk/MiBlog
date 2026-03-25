import "server-only";

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

export interface AdminRequestContext {
  correlationId: string;
  fingerprint: string;
  ipAddress: string | null;
  userAgent: string | null;
}

function buildFingerprint(ipAddress: string | null, userAgent: string | null) {
  return createHash("sha256")
    .update(`${ipAddress ?? "unknown"}|${userAgent ?? "unknown"}`)
    .digest("hex");
}

function getIpAddress(value: string | null) {
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim() || null;
}

function getCorrelationId(headerMap: Headers) {
  return (
    headerMap.get("x-request-id") ||
    headerMap.get("x-vercel-id") ||
    crypto.randomUUID()
  );
}

function toRequestContext(headerMap: Headers): AdminRequestContext {
  const ipAddress = getIpAddress(
    headerMap.get("x-forwarded-for") || headerMap.get("x-real-ip"),
  );
  const userAgent = headerMap.get("user-agent");

  return {
    correlationId: getCorrelationId(headerMap),
    fingerprint: buildFingerprint(ipAddress, userAgent),
    ipAddress,
    userAgent,
  };
}

export async function getActionRequestContext() {
  const headerStore = await headers();
  return toRequestContext(headerStore);
}

export function getRouteRequestContext(request: NextRequest) {
  return toRequestContext(request.headers);
}
