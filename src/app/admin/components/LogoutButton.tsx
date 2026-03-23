"use client";

import { logoutAction } from "../login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-neutral-600 hover:text-red-400 transition-colors"
      >
        Log out
      </button>
    </form>
  );
}
