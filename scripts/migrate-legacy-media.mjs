import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set before running the migration.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const LEGACY_BASE_URL = `${supabaseUrl}/storage/v1/object/public/blog-images/`;
const LEGACY_URL_PATTERN = new RegExp(
  `${LEGACY_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^"'?#\\s>]+)`,
  "g",
);

function inferMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

function extractLegacyPaths(html) {
  const matches = new Set();
  for (const match of html.matchAll(LEGACY_URL_PATTERN)) {
    if (match[1]) {
      matches.add(match[1]);
    }
  }
  return [...matches];
}

function replaceAll(html, replacements) {
  let output = html;
  for (const [legacyUrl, nextUrl] of replacements.entries()) {
    output = output.split(legacyUrl).join(nextUrl);
  }
  return output;
}

async function migrateLegacyAsset({ postId, status, legacyPath }) {
  const { data: blob, error: downloadError } = await supabase.storage
    .from("blog-images")
    .download(legacyPath);

  if (downloadError || !blob) {
    throw new Error(`Failed to download legacy asset "${legacyPath}": ${downloadError?.message ?? "missing blob"}`);
  }

  const extension = path.extname(legacyPath) || ".bin";
  const objectPath = `legacy/${postId}/${randomUUID()}${extension}`;
  const mimeType = blob.type || inferMimeType(legacyPath);
  const buffer = Buffer.from(await blob.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("blog-assets")
    .upload(objectPath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload migrated asset "${legacyPath}": ${uploadError.message}`);
  }

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      bucket_id: "blog-assets",
      object_path: objectPath,
      mime_type: mimeType,
      byte_size: buffer.byteLength,
      owner_post_id: postId,
      state: status,
    })
    .select("id")
    .single();

  if (assetError) {
    throw new Error(`Failed to register migrated asset "${legacyPath}": ${assetError.message}`);
  }

  return `/media/${asset.id}`;
}

async function main() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, slug, status, content")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  let migratedPosts = 0;
  let migratedAssets = 0;

  for (const post of posts ?? []) {
    const content = post.content ?? "";
    const legacyPaths = extractLegacyPaths(content);

    if (legacyPaths.length === 0) {
      continue;
    }

    const replacements = new Map();

    for (const legacyPath of legacyPaths) {
      const legacyUrl = `${LEGACY_BASE_URL}${legacyPath}`;
      const nextUrl = await migrateLegacyAsset({
        postId: post.id,
        status: post.status,
        legacyPath,
      });
      replacements.set(legacyUrl, nextUrl);
      migratedAssets += 1;
      console.log(`Migrated ${legacyPath} -> ${nextUrl}`);
    }

    const nextContent = replaceAll(content, replacements);

    const { error: updateError } = await supabase
      .from("posts")
      .update({ content: nextContent })
      .eq("id", post.id);

    if (updateError) {
      throw new Error(`Failed to update post ${post.slug}: ${updateError.message}`);
    }

    migratedPosts += 1;
    console.log(`Rewrote post ${post.slug}`);
  }

  const { data: remainingLegacyPosts, error: remainingError } = await supabase
    .from("posts")
    .select("id")
    .like("content", `%${LEGACY_BASE_URL}%`)
    .limit(1);

  if (remainingError) {
    throw remainingError;
  }

  if ((remainingLegacyPosts ?? []).length === 0) {
    const { error: bucketError } = await supabase.storage.updateBucket("blog-images", {
      public: false,
    });

    if (bucketError) {
      throw new Error(`Failed to disable public access on legacy bucket: ${bucketError.message}`);
    }

    console.log('Legacy bucket "blog-images" is now private.');
  } else {
    console.warn("Legacy URLs still remain in post content. Keeping blog-images public for now.");
  }

  console.log(
    `Migration complete. Posts updated: ${migratedPosts}. Assets migrated: ${migratedAssets}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
