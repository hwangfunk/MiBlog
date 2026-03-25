import type { PostStatus } from "@/types/blog";

export const PUBLIC_POSTS_CACHE_TAG = "public-posts";

export function getPublicPostCacheTag(slug: string) {
  return `public-post:${slug}`;
}

export interface PublicCacheInvalidationPlanInput {
  nextSlug: string;
  nextStatus: PostStatus;
  previousSlug?: string;
  previousStatus?: PostStatus;
}

export interface PublicCacheInvalidationPlan {
  tags: string[];
  paths: string[];
}

export function getPublicCacheInvalidationPlan({
  nextSlug,
  nextStatus,
  previousSlug,
  previousStatus,
}: PublicCacheInvalidationPlanInput): PublicCacheInvalidationPlan {
  const tags = new Set<string>();
  const paths = new Set<string>();

  const nextIsPublic = nextStatus === "published";
  const previousIsPublic = previousStatus === "published";

  if (nextIsPublic || previousIsPublic) {
    tags.add(PUBLIC_POSTS_CACHE_TAG);
    paths.add("/");
  }

  if (previousIsPublic && previousSlug) {
    tags.add(getPublicPostCacheTag(previousSlug));
    paths.add(`/blog/${previousSlug}`);
  }

  if (nextIsPublic) {
    tags.add(getPublicPostCacheTag(nextSlug));
    paths.add(`/blog/${nextSlug}`);
  }

  return {
    tags: [...tags],
    paths: [...paths],
  };
}
