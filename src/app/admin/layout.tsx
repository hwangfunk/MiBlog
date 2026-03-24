import Link from "next/link";
import { PageWrapper } from "@/components/PageWrapper";
import { AdminAura } from "@/components/admin/AdminAura";
import { LogoutButton } from "./components/LogoutButton";
import { verifySession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const isAuthenticated = !!session?.isAdmin;

  if (!isAuthenticated) {
    return (
      <PageWrapper className="flex flex-col flex-1 h-full">
        {children}
      </PageWrapper>
    );
  }

  return (
    <>
      <AdminAura label="Admin Workspace" />
      <PageWrapper className="flex flex-col flex-1 h-full max-w-3xl mx-auto w-full">
        <header className="mb-12 mt-6 flex flex-col gap-5 border-b border-neutral-800/60 pb-6 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl text-neutral-200 font-medium tracking-tight">Admin</h1>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← View site
            </Link>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </PageWrapper>
    </>
  );
}
