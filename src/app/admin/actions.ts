"use server"

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { savePost, deletePost as removePost } from "@/lib/posts";
import { BlogPost } from "@/types/blog";

export async function createOrUpdatePostAction(formData: FormData) {
  const originalSlug = formData.get("originalSlug") as string;
  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;
  const date = formData.get("date") as string;
  const content = formData.get("content") as string;

  if (!title || !slug || !date) {
    return { success: false, error: "Missing required fields" };
  }

  // Basic slugify if typed with spaces
  slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const post: BlogPost = {
    title,
    slug,
    date,
    content,
  };

  // If slug changed, delete the old one
  if (originalSlug && originalSlug !== slug) {
    await removePost(originalSlug);
  }

  const saved = await savePost(post);
  if (!saved) {
    return { success: false, error: "Failed to write post data" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/blog/${slug}`);

  // redirect() must be called outside try/catch — it throws internally
  redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
  const slug = formData.get("slug") as string;
  if (!slug) return;

  await removePost(slug);
  
  revalidatePath("/");
  revalidatePath("/admin");
}
