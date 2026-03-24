import { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB post-compression

export async function POST(request: NextRequest) {
  // Auth check — middleware doesn't cover /api/*, so verify manually
  const session = await verifySession();
  if (!session?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, AVIF' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  // Generate unique path: uploads/2026/03/uuid.ext
  const ext = file.name.split('.').pop() || 'jpg';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const path = `uploads/${year}/${month}/${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  return Response.json({ url: publicUrl });
}
