import { BlogPost, BlogPostSummary } from '@/types/blog';
import { supabase } from './supabase';

export type SaveResult =
  | { success: true }
  | { success: false; code: 'DUPLICATE_SLUG' | 'DB_ERROR'; message: string };

export async function listPosts(): Promise<BlogPostSummary[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, date')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BlogPostSummary[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as BlogPost | undefined;
}

export async function savePost(post: BlogPost): Promise<SaveResult> {
  try {
    if (post.id) {
      const { error } = await supabase
        .from('posts')
        .update({
          title: post.title,
          slug: post.slug,
          date: post.date,
          content: post.content,
        })
        .eq('id', post.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: post.title,
          slug: post.slug,
          date: post.date,
          content: post.content,
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return { success: false, code: 'DUPLICATE_SLUG', message: 'A post with this slug already exists.' };
    }
    return { success: false, code: 'DB_ERROR', message: 'Failed to save post.' };
  }
}

export async function deletePost(slug: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug);

  if (error) throw error;
}
