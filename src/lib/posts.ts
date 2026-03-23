import { BlogPost } from '@/types/blog';
import { supabase } from './supabase';

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data as BlogPost[];
  } catch (error) {
    console.error('Error fetching posts from Supabase:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    
    return data as BlogPost;
  } catch (error) {
    console.error(`Error fetching post ${slug} from Supabase:`, error);
    return undefined;
  }
}

export async function savePost(post: BlogPost): Promise<boolean> {
  try {
    // Upsert acts as an insert-or-update feature.
    // It relies on the 'slug' being unique or acting as a primary key.
    // However, since 'id' is our PK, we'll try an update first by matching 'slug'
    
    // Check if post already exists
    const { data: existingPost, error: selectError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', post.slug)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingPost) {
      // Update
      const { error } = await supabase
        .from('posts')
        .update({
          title: post.title,
          date: post.date,
          content: post.content
        })
        .eq('slug', post.slug);
      
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('posts')
        .insert([post]);
        
      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error saving post to Supabase:', error);
    return false;
  }
}

export async function deletePost(slug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting post ${slug} from Supabase:`, error);
    return false;
  }
}
