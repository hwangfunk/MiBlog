const MEDIA_URL_PATTERN = /(?:https?:\/\/[^"'>]+)?\/media\/([0-9a-fA-F-]{36})(?=["'?#/>\s]|$)/g;

function getLegacyPublicBaseUrl() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!projectUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }

  return `${projectUrl}/storage/v1/object/public/blog-images/`;
}

export function createMediaContentUrl(assetId: string) {
  return `/media/${assetId}`;
}

export function extractMediaAssetIdsFromHtml(html: string) {
  const ids = new Set<string>();

  for (const match of html.matchAll(MEDIA_URL_PATTERN)) {
    const assetId = match[1];
    if (assetId) {
      ids.add(assetId);
    }
  }

  return [...ids];
}

export function extractLegacyPublicAssetPaths(html: string) {
  const baseUrl = getLegacyPublicBaseUrl().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${baseUrl}([^"'?#\\s>]+)`, "g");
  const paths = new Set<string>();

  for (const match of html.matchAll(pattern)) {
    const path = match[1];
    if (path) {
      paths.add(path);
    }
  }

  return [...paths];
}

export function replaceLegacyPublicUrls(
  html: string,
  replacements: Map<string, string>,
) {
  let output = html;

  for (const [legacyUrl, replacement] of replacements.entries()) {
    output = output.split(legacyUrl).join(replacement);
  }

  return output;
}
