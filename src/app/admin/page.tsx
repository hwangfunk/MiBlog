import { Suspense } from "react";
import Link from "next/link";
import { DeleteButton } from "@/app/admin/components/DeleteButton";
import { formatDateTime, formatPublishedDate } from "@/lib/dates";
import { listAdminPosts } from "@/lib/posts";
import { requireAdminPageSession } from "@/lib/session";
import type { PostSummary } from "@/types/blog";

function StatusBadge({ status }: { status: PostSummary["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
        status === "published"
          ? "border-emerald-500/30 text-emerald-300"
          : "border-amber-500/30 text-amber-300"
      }`}
    >
      {status}
    </span>
  );
}

function PostSection({
  title,
  emptyState,
  posts,
}: {
  title: string;
  emptyState: string;
  posts: PostSummary[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{title}</h2>
        <p className="inline-flex min-w-8 items-center justify-center rounded-full border border-neutral-800/70 px-2.5 py-1 text-[11px] font-mono text-neutral-600">
          {posts.length}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-[1.75rem] border border-dashed border-neutral-800/80 px-4 py-10 text-center text-sm text-neutral-600">
          {emptyState}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group rounded-[1.75rem] border border-transparent bg-transparent px-4 py-4 transition-colors hover:border-neutral-800/70 hover:bg-neutral-950/60"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/admin/edit/${post.slug}`}
                  prefetch={false}
                  className="min-w-0 flex-1"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="truncate text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-neutral-50 sm:text-base">
                      {post.title}
                    </span>
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-neutral-600">
                    <span>/{post.slug}</span>
                    <span>
                      {post.status === "published"
                        ? formatPublishedDate(post.publishedAt)
                        : `Edited ${formatDateTime(post.updatedAt)}`}
                    </span>
                  </div>
                </Link>

                <div className="ml-0 flex shrink-0 items-center gap-2 sm:ml-6">
                  <Link
                    href={`/admin-preview/${post.slug}`}
                    prefetch={false}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800/80 text-neutral-600 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                    title="Preview saved post"
                    aria-label={`Preview ${post.title}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <DeleteButton
                    postId={post.id}
                    slug={post.slug}
                    title={post.title}
                    status={post.status}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-800/80 px-4 text-sm text-neutral-500 transition-colors hover:border-red-500/40 hover:text-red-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPageFallback() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-16 rounded-2xl border border-neutral-900 bg-neutral-950" />
      <div className="h-32 rounded-2xl border border-neutral-900 bg-neutral-950" />
      <div className="h-32 rounded-2xl border border-neutral-900 bg-neutral-950" />
    </div>
  );
}

async function AdminPageContent() {
  await requireAdminPageSession("/admin");
  const { drafts, published } = await listAdminPosts();
  const totalPosts = drafts.length + published.length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 border-b border-neutral-800/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-100">Posts</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {totalPosts} {totalPosts === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-100 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-cyan-50"
        >
          <span className="text-base leading-none">+</span>
          <span>New post</span>
        </Link>
      </div>

      <PostSection title="Drafts" emptyState="No drafts yet." posts={drafts} />
      <PostSection title="Published" emptyState="Nothing published yet." posts={published} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageFallback />}>
      <AdminPageContent />
    </Suspense>
  );
}
