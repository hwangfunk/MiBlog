import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { getPostBySlug, listPosts } from "@/lib/posts";
import { htmlToPlainText } from "@/lib/sanitize";
import BlogPostLoading from "./loading";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [{ params: { slug: "sample-post" } }],
};

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

async function BlogPostContent({ slug }: { slug: string }) {
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPage post={post} backHref="/" backLabel="Back to home" />;
}

export default function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<BlogPostLoading />}>
      {params.then(({ slug }) => (
        <BlogPostContent slug={slug} />
      ))}
    </Suspense>
  );
}
