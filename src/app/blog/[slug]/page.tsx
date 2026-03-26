import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/blog/BlogPostPage";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/posts";
import {
  SITE_AUTHOR_NAME,
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_OG_LOCALE,
  buildBlogPostingStructuredData,
  createMetadataDescription,
  createMetadataImage,
  getPostCanonicalPath,
  getPostModifiedTime,
  getPostOgImagePath,
  getPostPublishedTime,
  serializeJsonLd,
} from "@/lib/seo";

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

  const description = createMetadataDescription(post.contentHtml) || SITE_DESCRIPTION;
  const canonicalPath = getPostCanonicalPath(post.slug);
  const ogImage = createMetadataImage(
    getPostOgImagePath(post.slug),
    `${post.title} | ${SITE_BRAND_NAME}`,
  );

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: canonicalPath,
      title: post.title,
      description,
      type: "article",
      siteName: SITE_BRAND_NAME,
      locale: SITE_OG_LOCALE,
      publishedTime: getPostPublishedTime(post),
      modifiedTime: getPostModifiedTime(post),
      authors: [SITE_AUTHOR_NAME],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      creator: SITE_AUTHOR_NAME,
      images: [ogImage],
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

  const structuredData = buildBlogPostingStructuredData(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <BlogPostPage post={post} backHref="/" backLabel="Back to home" />
    </>
  );
}
