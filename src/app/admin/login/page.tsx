"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await loginAction(formData);
    },
    undefined
  );

  return (
    <div className="flex flex-col flex-1 h-full items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-xl text-neutral-200 font-medium tracking-tight mb-2">
            Admin
          </h1>
          <p className="text-neutral-600 text-sm">
            Enter password to continue
          </p>
        </div>

        {/* Login form */}
        <form action={action} className="flex flex-col gap-6">
          <input type="hidden" name="from" value={from} />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs text-neutral-600 uppercase tracking-widest"
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
              placeholder="••••••••"
              className="py-3 px-0 w-full bg-transparent border-b border-neutral-800 text-neutral-200 font-mono text-sm focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-800"
            />
          </div>

          {/* Error message */}
          {state?.error && (
            <p className="text-red-400/80 text-sm animate-fade-in">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 text-sm text-neutral-300 hover:text-cyan-400 transition-all duration-300 disabled:opacity-40 border-b border-transparent hover:border-cyan-400 pb-0.5 self-start"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
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
            ) : (
              "Log in →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 h-full items-center justify-center min-h-[60vh]">
          <p className="text-neutral-600 text-sm animate-pulse">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
