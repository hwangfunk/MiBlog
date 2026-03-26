import { describe, expect, it } from "vitest";
import {
  createMetadataDescription,
  extractPublicImageUrlFromHtml,
  resolveSiteUrl,
} from "@/lib/seo";

describe("seo helpers", () => {
  it("builds a trimmed description from sanitized html", () => {
    const description = createMetadataDescription(
      `
        <p>Hello <strong>world</strong> &amp; everyone.</p>
        <script>alert("xss")</script>
        <p>This sentence should stay readable after trimming.</p>
      `,
      70,
    );

    expect(description).toBe("Hello world & everyone. This sentence should stay readable after");
  });

  it("extracts the first crawlable image and resolves relative media urls", () => {
    process.env.SITE_URL = "https://blog.quangmin.me";

    const imageUrl = extractPublicImageUrlFromHtml(`
      <p>Intro</p>
      <img src="data:image/png;base64,abc123" />
      <img src="/media/123e4567-e89b-12d3-a456-426614174000" />
    `);

    expect(imageUrl).toBe(
      "https://blog.quangmin.me/media/123e4567-e89b-12d3-a456-426614174000",
    );
  });

  it("rejects vercel preview domains as canonical site url", () => {
    expect(() => resolveSiteUrl("https://miblog-preview.vercel.app")).toThrow(
      /vercel\.app domain/,
    );
  });
});
