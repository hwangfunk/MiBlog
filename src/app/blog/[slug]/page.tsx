import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/posts";
import { htmlToPlainTextForMetadata } from "@/lib/sanitize-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const description = htmlToPlainTextForMetadata(post.contentHtml);

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
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPage post={post} backHref="/" backLabel="Back to home" />;
}
