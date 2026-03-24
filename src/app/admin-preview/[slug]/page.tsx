import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { getPostBySlug } from "@/lib/posts";
import { verifySession } from "@/lib/session";

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();
  const session = await verifySession();

  if (!session?.isAdmin) {
    redirect(`/admin/login?from=${encodeURIComponent(`/admin-preview/${slug}`)}`);
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostPage
      post={post}
      backHref="/admin"
      backLabel="Back to Admin"
      adminLabel="Admin Preview"
    />
  );
}
