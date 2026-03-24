"use server"

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { savePost, deletePost as removePost } from "@/lib/posts";
import { BlogPost } from "@/types/blog";

export async function createOrUpdatePostAction(formData: FormData) {
  const id = formData.get("id") as string;
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
    id: id ? Number(id) : undefined,
    title,
    slug,
    date,
    content,
  };

  const result = await savePost(post);

  if (!result.success) {
    if (result.code === 'DUPLICATE_SLUG') {
      return { success: false, error: "Slug đã tồn tại, vui lòng chọn slug khác." };
    }
    return { success: false, error: result.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/blog/${slug}`);

  // Revalidate old path if slug changed
  if (originalSlug && originalSlug !== slug) {
    revalidatePath(`/blog/${originalSlug}`);
  }

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
