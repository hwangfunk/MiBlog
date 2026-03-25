import { fileTypeFromBuffer } from "file-type";
import type { NextRequest } from "next/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";
import { getRouteRequestContext } from "@/lib/admin-request";
import { createMediaContentUrl } from "@/lib/media";
import { requireAdminMutationSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const requestContext = getRouteRequestContext(request);
  const auth = await requireAdminMutationSession();

  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength > MAX_SIZE) {
    return Response.json({ error: "File too large (max 5MB)." }, { status: 400 });
  }

  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType || !ALLOWED_TYPES.has(detectedType.mime)) {
    return Response.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, AVIF." },
      { status: 400 },
    );
  }

  const now = new Date();
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${detectedType.ext}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-assets")
    .upload(path, buffer, {
      contentType: detectedType.mime,
      upsert: false,
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      bucket_id: "blog-assets",
      object_path: path,
      mime_type: detectedType.mime,
      byte_size: buffer.byteLength,
      state: "draft",
    })
    .select("id")
    .single();

  if (assetError) {
    await supabase.storage.from("blog-assets").remove([path]);
    return Response.json({ error: assetError.message }, { status: 500 });
  }

  await logAdminAuditEvent({
    eventType: "media.uploaded",
    success: true,
    requestContext,
    metadata: {
      assetId: (asset as { id: string }).id,
      path,
      mimeType: detectedType.mime,
      byteSize: buffer.byteLength,
    },
  });

  return Response.json({
    assetId: (asset as { id: string }).id,
    contentUrl: createMediaContentUrl((asset as { id: string }).id),
  });
}
