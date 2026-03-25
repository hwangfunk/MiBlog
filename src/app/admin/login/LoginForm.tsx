"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { LoginActionState } from "@/app/admin/login/actions";
import { loginAction } from "@/app/admin/login/actions";

const INITIAL_STATE: LoginActionState = {
  error: null,
  lockedUntil: null,
  requestId: null,
};

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL_STATE);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!state.lockedUntil) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const nextRemaining = Date.parse(state.lockedUntil ?? "") - Date.now();
      setRemainingMs(Math.max(0, nextRemaining));
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state.lockedUntil]);

  const isLocked = remainingMs > 0;
  const helperMessage = useMemo(() => {
    if (isLocked) {
      return `Locked. Try again in ${formatCountdown(remainingMs)}.`;
    }

    return "Enter password to continue";
  }, [isLocked, remainingMs]);

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="mb-2 text-xl font-medium tracking-tight text-neutral-200">
            Admin
          </h1>
          <p className="text-sm text-neutral-600">{helperMessage}</p>
        </div>

        <form action={action} className="flex flex-col gap-6">
          <input type="hidden" name="from" value={from} />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-neutral-600"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
              disabled={pending || isLocked}
              placeholder="••••••••"
              className="w-full border-b border-neutral-800 bg-transparent px-0 py-3 font-mono text-sm text-neutral-200 transition-colors placeholder:text-neutral-800 focus:border-neutral-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {state.error ? (
            <div className="space-y-1 text-sm text-red-300">
              <p>{state.error}</p>
              {state.requestId ? (
                <p className="font-mono text-xs text-neutral-600">
                  Request: {state.requestId}
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending || isLocked}
            className="mt-2 self-start border-b border-transparent pb-0.5 text-sm text-neutral-300 transition-all duration-300 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-40"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Authenticating...
              </span>
            ) : isLocked ? (
              "Temporarily locked"
            ) : (
              "Log in →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
