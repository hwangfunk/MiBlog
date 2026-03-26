import type { Metadata } from "next";
import { htmlToPlainText, sanitizeHtml } from "@/lib/sanitize";
import type { PostDetail, PostSummary } from "@/types/blog";

export const SITE_BRAND_NAME = "Just Raw Blog";
export const SITE_AUTHOR_NAME = "Quang Minh";
export const SITE_DESCRIPTION =
  "Just Raw Blog là blog tiếng Việt của Quang Minh, nơi ghi lại lập trình, sản phẩm, kỹ thuật và những ghi chú làm việc ngắn, thẳng, thực tế.";
export const SITE_OG_LOCALE = "vi_VN";
export const SITE_LANGUAGE = "vi-VN";
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
} satisfies NonNullable<Metadata["robots"]>;

export const NO_INDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies NonNullable<Metadata["robots"]>;

const IMG_SRC_PATTERN = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi;
const BLOCKED_INTERNAL_PATH_PREFIXES = ["/admin", "/admin-preview", "/api/", "/_next/"];

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function truncateAtWordBoundary(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const slice = value.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(" ");

  if (lastSpace >= Math.floor(maxLength * 0.6)) {
    return slice.slice(0, lastSpace).trim();
  }

  return slice.slice(0, maxLength).trim();
}

function isBlockedInternalPath(pathname: string) {
  return BLOCKED_INTERNAL_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function resolveSiteUrl(input: string | undefined) {
  if (!input) {
    throw new Error("SITE_URL environment variable is not set");
  }

  const url = new URL(input);

  if (url.protocol !== "https:") {
    throw new Error("SITE_URL must use https");
  }

  if (url.hostname.endsWith(".vercel.app")) {
    throw new Error("SITE_URL must not point to a vercel.app domain");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url;
}

export function getSiteUrl() {
  return resolveSiteUrl(process.env.SITE_URL);
}

export function getCanonicalUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString();
}

export function getSitemapUrl() {
  return getCanonicalUrl("/sitemap.xml");
}

export function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

export function getDefaultRobotsMetadata() {
  return isProductionDeployment() ? INDEXABLE_ROBOTS : NO_INDEX_ROBOTS;
}

export function createMetadataDescription(html: string, maxLength = 158) {
  const sanitizedHtml = sanitizeHtml(html);
  const plainText = decodeHtmlEntities(
    htmlToPlainText(sanitizedHtml, Math.max(sanitizedHtml.length, maxLength)),
  )
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "";
  }

  return truncateAtWordBoundary(plainText, maxLength);
}

export function extractPublicImageUrlFromHtml(html: string) {
  const sanitizedHtml = sanitizeHtml(html);
  const siteUrl = getSiteUrl();

  for (const match of sanitizedHtml.matchAll(IMG_SRC_PATTERN)) {
    const rawSrc = match[1];

    if (!rawSrc || rawSrc.startsWith("data:") || rawSrc.startsWith("#")) {
      continue;
    }

    const imageUrl = new URL(rawSrc, siteUrl);

    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      continue;
    }

    if (imageUrl.origin === siteUrl.origin && isBlockedInternalPath(imageUrl.pathname)) {
      continue;
    }

    return imageUrl.toString();
  }

  return null;
}

export function createMetadataImage(path: string, alt: string) {
  return {
    url: path,
    alt,
    ...OG_IMAGE_SIZE,
  };
}

export function getPostCanonicalPath(slug: string) {
  return `/blog/${slug}`;
}

export function getPostOgImagePath(slug: string) {
  return `${getPostCanonicalPath(slug)}/opengraph-image`;
}

export function getPostPublishedTime(post: Pick<PostDetail, "publishedAt" | "createdAt">) {
  return post.publishedAt ?? post.createdAt;
}

export function getPostModifiedTime(
  post: Pick<PostDetail, "updatedAt" | "publishedAt" | "createdAt">,
) {
  return post.updatedAt ?? post.publishedAt ?? post.createdAt;
}

export function getHomepageLastModified(posts: PostSummary[]) {
  const timestamps = posts
    .map((post) => post.updatedAt ?? post.publishedAt ?? post.createdAt)
    .filter(Boolean)
    .map((value) => Date.parse(value));

  if (timestamps.length === 0) {
    return undefined;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

export function buildBlogPostingStructuredData(post: PostDetail) {
  const description = createMetadataDescription(post.contentHtml) || SITE_DESCRIPTION;
  const canonicalUrl = getCanonicalUrl(getPostCanonicalPath(post.slug));
  const publishedTime = getPostPublishedTime(post);
  const modifiedTime = getPostModifiedTime(post);
  const contentImageUrl = extractPublicImageUrlFromHtml(post.contentHtml);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR_NAME,
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR_NAME,
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    inLanguage: SITE_LANGUAGE,
  } as {
    "@context": string;
    "@type": string;
    headline: string;
    description: string;
    datePublished: string;
    dateModified: string;
    author: {
      "@type": string;
      name: string;
    };
    publisher: {
      "@type": string;
      name: string;
    };
    mainEntityOfPage: string;
    url: string;
    inLanguage: string;
    image?: string;
  };

  if (contentImageUrl) {
    structuredData.image = contentImageUrl;
  }

  return structuredData;
}

export function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
