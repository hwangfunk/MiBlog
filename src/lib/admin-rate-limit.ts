import "server-only";

import { supabase } from "@/lib/supabase";

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_COOLDOWN_MS = 30 * 60 * 1000;

interface AdminLoginAttemptRow {
  fingerprint: string;
  attempt_count: number;
  first_attempt_at: string;
  last_attempt_at: string;
  blocked_until: string | null;
}

function isWithinWindow(firstAttemptAt: string, now: Date) {
  return now.getTime() - Date.parse(firstAttemptAt) <= LOGIN_WINDOW_MS;
}

async function getAdminLoginAttemptRow(fingerprint: string) {
  const { data, error } = await supabase
    .from("admin_login_attempts")
    .select("fingerprint, attempt_count, first_attempt_at, last_attempt_at, blocked_until")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AdminLoginAttemptRow | null;
}

export async function getAdminLoginRateLimit(fingerprint: string) {
  const now = new Date();
  const row = await getAdminLoginAttemptRow(fingerprint);

  if (!row) {
    return {
      attempts: 0,
      blockedUntil: null as string | null,
      remainingAttempts: LOGIN_MAX_ATTEMPTS,
    };
  }

  if (row.blocked_until && Date.parse(row.blocked_until) > now.getTime()) {
    return {
      attempts: row.attempt_count,
      blockedUntil: row.blocked_until,
      remainingAttempts: 0,
    };
  }

  if (!isWithinWindow(row.first_attempt_at, now)) {
    return {
      attempts: 0,
      blockedUntil: null as string | null,
      remainingAttempts: LOGIN_MAX_ATTEMPTS,
    };
  }

  return {
    attempts: row.attempt_count,
    blockedUntil: null as string | null,
    remainingAttempts: Math.max(0, LOGIN_MAX_ATTEMPTS - row.attempt_count),
  };
}

export async function registerFailedAdminLoginAttempt(fingerprint: string) {
  const now = new Date();
  const row = await getAdminLoginAttemptRow(fingerprint);

  if (row?.blocked_until && Date.parse(row.blocked_until) > now.getTime()) {
    return {
      blockedUntil: row.blocked_until,
      remainingAttempts: 0,
    };
  }

  const shouldResetWindow = !row || !isWithinWindow(row.first_attempt_at, now);
  const nextAttemptCount = shouldResetWindow ? 1 : row.attempt_count + 1;
  const blockedUntil =
    nextAttemptCount >= LOGIN_MAX_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_COOLDOWN_MS).toISOString()
      : null;

  const payload = {
    fingerprint,
    attempt_count: nextAttemptCount,
    first_attempt_at: shouldResetWindow ? now.toISOString() : row.first_attempt_at,
    last_attempt_at: now.toISOString(),
    blocked_until: blockedUntil,
  };

  const { error } = await supabase.from("admin_login_attempts").upsert(payload);

  if (error) {
    throw error;
  }

  return {
    blockedUntil,
    remainingAttempts: Math.max(0, LOGIN_MAX_ATTEMPTS - nextAttemptCount),
  };
}

export async function clearAdminLoginAttempts(fingerprint: string) {
  const { error } = await supabase
    .from("admin_login_attempts")
    .delete()
    .eq("fingerprint", fingerprint);

  if (error) {
    throw error;
  }
}
