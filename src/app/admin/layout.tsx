import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { PageWrapper } from "@/components/PageWrapper";
import { AdminAura } from "@/components/admin/AdminAura";
import { getAdminSessionOrNull } from "@/lib/session";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import { LogoutButton } from "./components/LogoutButton";

export const metadata = {
  robots: NO_INDEX_ROBOTS,
};

function AdminLayoutFallback() {
  return (
    <PageWrapper className="flex h-full min-h-[60vh] w-full flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-neutral-600 animate-pulse">Loading admin...</p>
      </div>
    </PageWrapper>
  );
}

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getAdminSessionOrNull();

  if (!session?.isAdmin) {
    return <PageWrapper className="flex h-full min-h-[60vh] w-full flex-1 flex-col">{children}</PageWrapper>;
  }

  return (
    <>
      <AdminAura label="Admin Workspace">
        <Link href="/" className="admin-mode-action">
          View site
        </Link>
        <LogoutButton className="admin-mode-action admin-mode-action-danger" />
      </AdminAura>
      <PageWrapper className="mx-auto flex h-full min-h-[60vh] w-full max-w-4xl flex-1 flex-col">
        <header className="mb-8 border-b border-neutral-800/60 pb-5 pt-24 sm:mb-10 sm:pt-28">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/55">Workspace</p>
            <h1 className="mt-2 text-xl font-medium tracking-tight text-neutral-100">Admin</h1>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </PageWrapper>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
