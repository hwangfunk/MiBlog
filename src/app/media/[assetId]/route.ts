import { getAdminSessionOrNull } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface MediaAssetRow {
  id: string;
  bucket_id: string;
  object_path: string;
  mime_type: string;
  state: "draft" | "published" | "orphaned";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, bucket_id, object_path, mime_type, state")
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const asset = data as MediaAssetRow | null;

  if (!asset || asset.state === "orphaned") {
    return new Response("Not found", { status: 404 });
  }

  if (asset.state === "draft") {
    const session = await getAdminSessionOrNull();

    if (!session?.isAdmin) {
      return new Response("Not found", { status: 404 });
    }
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(asset.bucket_id)
    .download(asset.object_path);

  if (downloadError || !blob) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob, {
    headers: {
      "Content-Type": asset.mime_type,
      "Cache-Control":
        asset.state === "published"
          ? "public, max-age=31536000, immutable"
          : "private, no-store",
    },
  });
}
