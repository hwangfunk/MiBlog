import { Suspense } from "react";
import Link from "next/link";
import PostEditor from "@/app/admin/components/PostEditor";
import { requireAdminPageSession } from "@/lib/session";

function NewPostPageFallback() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div>
        <div className="h-7 w-32 rounded bg-neutral-900" />
        <div className="mt-3 h-4 w-72 rounded bg-neutral-950" />
      </div>
      <div className="h-96 rounded-2xl border border-neutral-900 bg-neutral-950" />
    </div>
  );
}

async function NewPostPageContent() {
  await requireAdminPageSession("/admin/new");
  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-neutral-800/50 pb-5">
        <Link
          href="/admin"
          prefetch={false}
          className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300"
        >
          Posts
        </Link>
        <h2 className="mt-3 text-2xl font-medium tracking-tight text-neutral-100">New post</h2>
      </div>
      <PostEditor />
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<NewPostPageFallback />}>
      <NewPostPageContent />
    </Suspense>
  );
}
