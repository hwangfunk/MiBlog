import "server-only";

import {
  createMediaContentUrl,
  extractLegacyPublicAssetPaths,
  extractMediaAssetIdsFromHtml,
  replaceLegacyPublicUrls,
} from "@/lib/media-helpers";
import { supabase } from "@/lib/supabase";
import type { PostStatus } from "@/types/blog";

export {
  createMediaContentUrl,
  extractLegacyPublicAssetPaths,
  extractMediaAssetIdsFromHtml,
  replaceLegacyPublicUrls,
};

export async function syncPostMediaAssets({
  postId,
  status,
  contentHtml,
}: {
  postId: number;
  status: PostStatus;
  contentHtml: string;
}) {
  const referencedAssetIds = extractMediaAssetIdsFromHtml(contentHtml);

  if (referencedAssetIds.length > 0) {
    const { error: claimError } = await supabase
      .from("media_assets")
      .update({
        owner_post_id: postId,
        state: status,
        last_referenced_at: new Date().toISOString(),
      })
      .in("id", referencedAssetIds);

    if (claimError) {
      throw claimError;
    }
  }

  const { data: existingAssets, error: existingAssetsError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("owner_post_id", postId);

  if (existingAssetsError) {
    throw existingAssetsError;
  }

  const orphanedIds = (existingAssets as Array<{ id: string }> | null)
    ?.map((asset) => asset.id)
    .filter((id) => !referencedAssetIds.includes(id)) ?? [];

  if (orphanedIds.length > 0) {
    const { error: orphanError } = await supabase
      .from("media_assets")
      .update({
        owner_post_id: null,
        state: "orphaned",
        last_referenced_at: new Date().toISOString(),
      })
      .in("id", orphanedIds);

    if (orphanError) {
      throw orphanError;
    }
  }
}

export async function deletePostMediaAssets(postId: number) {
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, bucket_id, object_path")
    .eq("owner_post_id", postId);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return;
  }

  const assetsByBucket = new Map<string, string[]>();

  for (const asset of data) {
    const paths = assetsByBucket.get(asset.bucket_id) ?? [];
    paths.push(asset.object_path);
    assetsByBucket.set(asset.bucket_id, paths);
  }

  for (const [bucketId, paths] of assetsByBucket.entries()) {
    const { error: removeError } = await supabase.storage.from(bucketId).remove(paths);
    if (removeError) {
      throw removeError;
    }
  }

  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("owner_post_id", postId);

  if (deleteError) {
    throw deleteError;
  }
}
