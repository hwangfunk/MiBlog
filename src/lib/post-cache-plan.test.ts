import { describe, expect, it } from "vitest";
import { getPublicCacheInvalidationPlan } from "@/lib/post-cache-plan";

describe("getPublicCacheInvalidationPlan", () => {
  it("does nothing for draft-only edits", () => {
    expect(
      getPublicCacheInvalidationPlan({
        previousSlug: "draft-post",
        previousStatus: "draft",
        nextSlug: "draft-post",
        nextStatus: "draft",
      }),
    ).toEqual({ tags: [], paths: [] });
  });

  it("invalidates home and slug paths when publishing a draft", () => {
    expect(
      getPublicCacheInvalidationPlan({
        previousSlug: "draft-post",
        previousStatus: "draft",
        nextSlug: "draft-post",
        nextStatus: "published",
      }),
    ).toEqual({
      tags: ["public-posts", "public-post:draft-post"],
      paths: ["/", "/blog/draft-post"],
    });
  });

  it("invalidates old and new slug when a published post changes slug", () => {
    expect(
      getPublicCacheInvalidationPlan({
        previousSlug: "old-slug",
        previousStatus: "published",
        nextSlug: "new-slug",
        nextStatus: "published",
      }),
    ).toEqual({
      tags: ["public-posts", "public-post:old-slug", "public-post:new-slug"],
      paths: ["/", "/blog/old-slug", "/blog/new-slug"],
    });
  });
});
