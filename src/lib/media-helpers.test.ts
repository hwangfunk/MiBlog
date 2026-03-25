import { beforeEach, describe, expect, it } from "vitest";
import {
  createMediaContentUrl,
  extractLegacyPublicAssetPaths,
  extractMediaAssetIdsFromHtml,
  replaceLegacyPublicUrls,
} from "@/lib/media-helpers";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
});

describe("media helpers", () => {
  it("extracts canonical media asset ids from HTML", () => {
    const html =
      '<p><img src="/media/123e4567-e89b-12d3-a456-426614174000" /></p>';

    expect(extractMediaAssetIdsFromHtml(html)).toEqual([
      "123e4567-e89b-12d3-a456-426614174000",
    ]);
  });

  it("extracts legacy public storage paths", () => {
    const html =
      '<img src="https://example.supabase.co/storage/v1/object/public/blog-images/uploads/2026/03/photo.webp" />';

    expect(extractLegacyPublicAssetPaths(html)).toEqual([
      "uploads/2026/03/photo.webp",
    ]);
  });

  it("replaces legacy URLs with canonical media routes", () => {
    const legacyUrl =
      "https://example.supabase.co/storage/v1/object/public/blog-images/uploads/2026/03/photo.webp";
    const replacement = createMediaContentUrl("123e4567-e89b-12d3-a456-426614174000");

    expect(
      replaceLegacyPublicUrls(
        `<img src="${legacyUrl}" />`,
        new Map([[legacyUrl, replacement]]),
      ),
    ).toContain(replacement);
  });
});
