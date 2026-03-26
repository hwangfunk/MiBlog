import { notFound } from "next/navigation";
import { createOgImage } from "@/lib/og-image";
import { getPublishedPostBySlug } from "@/lib/posts";
import { SITE_BRAND_NAME } from "@/lib/seo";

export const alt = SITE_BRAND_NAME;
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return createOgImage({
    eyebrow: SITE_BRAND_NAME,
    title: post.title,
    subtitle: "Bai viet tren Just Raw Blog",
    footer: "Quang Minh",
  });
}
