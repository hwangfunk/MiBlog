import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { getAdminSessionOrNull } from "@/lib/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getAdminSessionOrNull();

  if (session?.isAdmin) {
    redirect("/admin");
  }

  const { from = "/admin" } = await searchParams;

  return <LoginForm from={from} />;
}
