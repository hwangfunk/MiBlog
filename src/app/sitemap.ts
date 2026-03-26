import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/posts";
import {
  getCanonicalUrl,
  getHomepageLastModified,
  getPostCanonicalPath,
  getPostModifiedTime,
} from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  return [
    {
      url: getCanonicalUrl("/"),
      lastModified: getHomepageLastModified(posts),
    },
    ...posts.map((post) => ({
      url: getCanonicalUrl(getPostCanonicalPath(post.slug)),
      lastModified: getPostModifiedTime(post),
    })),
  ];
}
