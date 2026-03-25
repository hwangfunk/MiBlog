import { describe, expect, it } from "vitest";
import { normalizeSlug } from "@/lib/slug";
import { validatePostInput } from "@/lib/posts-validation";

describe("normalizeSlug", () => {
  it("normalizes mixed input into a stable slug", () => {
    expect(normalizeSlug("  Hello World!!!  ")).toBe("hello-world");
  });

  it("can collapse entirely invalid input into an empty slug", () => {
    expect(normalizeSlug("!!!")).toBe("");
  });
});

describe("validatePostInput", () => {
  it("rejects published posts without a publish date", () => {
    const result = validatePostInput({
      title: "Hello",
      slug: "hello-world",
      status: "published",
      publishedAt: null,
      contentHtml: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.publishedAt).toContain("Publish date");
    }
  });

  it("rejects inline data URLs", () => {
    const result = validatePostInput({
      title: "Hello",
      slug: "hello-world",
      status: "draft",
      publishedAt: null,
      contentHtml: '<p><img src="data:image/png;base64,abc" /></p>',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.contentHtml).toContain("Inline data URLs");
    }
  });

  it("returns normalized data for a valid draft", () => {
    const result = validatePostInput({
      title: "  Hello World  ",
      slug: "Hello World",
      status: "draft",
      publishedAt: null,
      contentHtml: "<p>Hello</p>",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("hello-world");
      expect(result.data.title).toBe("Hello World");
    }
  });
});
