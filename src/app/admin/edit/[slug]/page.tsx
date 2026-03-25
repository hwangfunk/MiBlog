import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPostBySlug } from "@/lib/posts";
import { requireAdminPageSession } from "@/lib/session";
import PostEditor from "../../components/PostEditor";

function EditPostPageFallback() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div>
        <div className="h-7 w-32 rounded bg-neutral-900" />
        <div className="mt-3 h-4 w-40 rounded bg-neutral-950" />
      </div>

      <div className="space-y-6">
        <div className="h-16 rounded border border-neutral-900 bg-neutral-950" />
        <div className="h-12 rounded border border-neutral-900 bg-neutral-950" />
        <div className="h-80 rounded border border-neutral-900 bg-neutral-950" />
      </div>
    </div>
  );
}

async function EditPostPageContent({ slug }: { slug: string }) {
  await requireAdminPageSession(`/admin/edit/${slug}`);
  const post = await getAdminPostBySlug(slug);

  if (!post) {
    notFound();
  }

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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-medium tracking-tight text-neutral-100">Edit post</h2>
          <p className="rounded-full border border-neutral-800/80 px-3 py-1 text-xs font-mono text-neutral-500">
            /{post.slug}
          </p>
        </div>
      </div>
      <PostEditor post={post} />
    </div>
  );
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<EditPostPageFallback />}>
      {params.then(({ slug }) => <EditPostPageContent slug={slug} />)}
    </Suspense>
  );
}
