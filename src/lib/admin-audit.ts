import "server-only";

import { supabase } from "@/lib/supabase";
import type { AdminRequestContext } from "@/lib/admin-request";

interface AdminAuditPayload {
  eventType: string;
  success: boolean;
  requestContext: AdminRequestContext;
  metadata?: Record<string, unknown>;
}

export async function logAdminAuditEvent({
  eventType,
  success,
  requestContext,
  metadata = {},
}: AdminAuditPayload) {
  const { error } = await supabase.from("admin_audit_log").insert({
    event_type: eventType,
    success,
    fingerprint: requestContext.fingerprint,
    ip_address: requestContext.ipAddress,
    user_agent: requestContext.userAgent,
    metadata: {
      correlationId: requestContext.correlationId,
      ...metadata,
    },
  });

  if (error) {
    console.error("Failed to write admin audit log", {
      eventType,
      error: error.message,
      correlationId: requestContext.correlationId,
    });
  }
}
