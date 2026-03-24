import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/PageWrapper";
import { AdminAura } from "@/components/admin/AdminAura";
import { FadeInStagger, FadeInStaggerItem } from "@/components/animations/FadeInStagger";
import { getPostBySlug, listPosts } from "@/lib/posts";
import { sanitizeHtml, htmlToPlainText } from "@/lib/sanitize";
import { verifySession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const description = post.content ? htmlToPlainText(post.content) : "";

  return {
    title: `${post.title} | qanx._.minhhh blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const adminSession = from === "admin" ? await verifySession() : null;
  const isAdminPreview = from === "admin" && !!adminSession?.isAdmin;

  return (
    <>
      {isAdminPreview ? <AdminAura label="Admin Preview" /> : null}
      <PageWrapper className="flex flex-col flex-1">
        <FadeInStagger className="flex-1 mt-8 md:mt-16">
          <FadeInStaggerItem className="mb-12 border-b border-neutral-900 pb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-neutral-200 mb-4 tracking-tight">
              {post.title}
            </h1>
            <time className="text-neutral-500 font-mono text-sm">
              {post.date}
            </time>
          </FadeInStaggerItem>

          <FadeInStaggerItem className="space-y-6 text-neutral-400 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || "") }} />
          </FadeInStaggerItem>

          <FadeInStaggerItem className="mt-16 pb-8">
            <Link
              href={isAdminPreview ? "/admin" : "/"}
              className="text-neutral-500 hover:text-neutral-300 transition-colors inline-block"
            >
              &larr;{" "}
              <span className="ml-1 border-b border-transparent hover:border-neutral-500 pb-0.5 transition-colors">
                {isAdminPreview ? "Back to Admin" : "Back to home"}
              </span>
            </Link>
          </FadeInStaggerItem>
        </FadeInStagger>
      </PageWrapper>
    </>
  );
}
