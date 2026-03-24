"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession, verifyPassword } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Please enter password" };
  }

  const isValid = await verifyPassword(password);

  if (!isValid) {
    return { error: "Incorrect password" };
  }

  await createSession();

  const from = formData.get("from") as string;
  // Only allow internal redirects to prevent open redirect attacks
  const safeFrom = from && from.startsWith("/") && !from.startsWith("//") ? from : "/admin";
  redirect(safeFrom);
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
