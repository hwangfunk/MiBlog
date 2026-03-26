import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { getAdminPostBySlug } from "@/lib/posts";
import { requireAdminPageSession } from "@/lib/session";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata = {
  robots: NO_INDEX_ROBOTS,
};

function AdminPreviewFallback() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
      <p className="text-sm text-neutral-600 animate-pulse">Loading preview...</p>
    </div>
  );
}

async function AdminPreviewPageContent({ slug }: { slug: string }) {
  await connection();
  await requireAdminPageSession(`/admin-preview/${slug}`);

  const post = await getAdminPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostPage
      post={post}
      backHref="/admin"
      backLabel="Back to Admin"
      adminLabel="Saved Preview"
      notice="This page renders the last saved version. Use the editor preview tab to inspect unsaved changes."
    />
  );
}

export default function AdminPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<AdminPreviewFallback />}>
      {params.then(({ slug }) => <AdminPreviewPageContent slug={slug} />)}
    </Suspense>
  );
}
