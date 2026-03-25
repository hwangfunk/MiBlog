"use client";

import { logoutAction } from "../login/actions";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className="shrink-0">
      <button
        type="submit"
        className={
          className ?? "inline-flex whitespace-nowrap text-sm text-neutral-600 transition-colors hover:text-red-400"
        }
      >
        Log out
      </button>
    </form>
  );
}
