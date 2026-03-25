import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { deletePostMediaAssets, syncPostMediaAssets } from "@/lib/media";
import {
  PUBLIC_POSTS_CACHE_TAG,
  getPublicPostCacheTag,
} from "@/lib/post-cache-plan";
import { supabase } from "@/lib/supabase";
import type {
  AdminListGroups,
  PostDetail,
  PostStatus,
  PostSummary,
  PostUpsertInput,
} from "@/types/blog";

interface PostRow {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  content: string;
}

export type SavePostErrorCode = "DUPLICATE_SLUG" | "NOT_FOUND" | "DB_ERROR";

export type SavePostResult =
  | {
      success: true;
      post: PostDetail;
      previousPost?: Pick<PostDetail, "slug" | "status">;
    }
  | {
      success: false;
      code: SavePostErrorCode;
      message: string;
    };

export type DeletePostResult =
  | {
      success: true;
      deletedPost: Pick<PostDetail, "slug" | "status">;
    }
  | {
      success: false;
      code: "NOT_FOUND" | "DB_ERROR";
      message: string;
    };

function applyPublicCachePolicy() {
  cacheLife({
    stale: 30,
    revalidate: 60 * 60 * 24,
    expire: 60 * 60 * 24 * 7,
  });
}

function mapPostRow(row: PostRow): PostDetail {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    contentHtml: row.content ?? "",
  };
}

function mapPostSummary(row: PostRow): PostSummary {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function isDuplicateSlugError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function listPublishedPosts(): Promise<PostSummary[]> {
  "use cache";

  applyPublicCachePolicy();
  cacheTag(PUBLIC_POSTS_CACHE_TAG);

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as PostRow[]).map(mapPostSummary);
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  "use cache";

  applyPublicCachePolicy();
  cacheTag(PUBLIC_POSTS_CACHE_TAG, getPublicPostCacheTag(slug));

  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at, content")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapPostRow(data as PostRow) : null;
}

export async function listAdminPosts(): Promise<AdminListGroups> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data as PostRow[]).map(mapPostSummary);

  return {
    drafts: rows
      .filter((post) => post.status === "draft")
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)),
    published: rows
      .filter((post) => post.status === "published")
      .sort((left, right) => {
        const leftDate = left.publishedAt ? Date.parse(left.publishedAt) : 0;
        const rightDate = right.publishedAt ? Date.parse(right.publishedAt) : 0;
        return rightDate - leftDate;
      }),
  };
}

export async function getAdminPostBySlug(slug: string): Promise<PostDetail | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at, content")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapPostRow(data as PostRow) : null;
}

export async function createPost(input: PostUpsertInput): Promise<SavePostResult> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: input.title,
        slug: input.slug,
        status: input.status,
        published_at: input.publishedAt,
        content: input.contentHtml,
      })
      .select("id, slug, title, status, published_at, updated_at, created_at, content")
      .single();

    if (error) {
      throw error;
    }

    const post = mapPostRow(data as PostRow);
    await syncPostMediaAssets({
      postId: Number(post.id),
      status: post.status,
      contentHtml: post.contentHtml,
    });

    return {
      success: true,
      post,
    };
  } catch (error: unknown) {
    if (isDuplicateSlugError(error)) {
      return {
        success: false,
        code: "DUPLICATE_SLUG",
        message: "A post with this slug already exists.",
      };
    }

    return {
      success: false,
      code: "DB_ERROR",
      message: "Failed to create post.",
    };
  }
}

export async function updatePost(postId: string, input: PostUpsertInput): Promise<SavePostResult> {
  try {
    const { data: existingPost, error: existingPostError } = await supabase
      .from("posts")
      .select("id, slug, title, status, published_at, updated_at, created_at, content")
      .eq("id", Number(postId))
      .maybeSingle();

    if (existingPostError) {
      throw existingPostError;
    }

    if (!existingPost) {
      return {
        success: false,
        code: "NOT_FOUND",
        message: "The post no longer exists.",
      };
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        title: input.title,
        slug: input.slug,
        status: input.status,
        published_at: input.publishedAt,
        content: input.contentHtml,
      })
      .eq("id", Number(postId))
      .select("id, slug, title, status, published_at, updated_at, created_at, content")
      .single();

    if (error) {
      throw error;
    }

    const post = mapPostRow(data as PostRow);
    await syncPostMediaAssets({
      postId: Number(post.id),
      status: post.status,
      contentHtml: post.contentHtml,
    });

    const previousPost = mapPostRow(existingPost as PostRow);

    return {
      success: true,
      post,
      previousPost: {
        slug: previousPost.slug,
        status: previousPost.status,
      },
    };
  } catch (error: unknown) {
    if (isDuplicateSlugError(error)) {
      return {
        success: false,
        code: "DUPLICATE_SLUG",
        message: "A post with this slug already exists.",
      };
    }

    return {
      success: false,
      code: "DB_ERROR",
      message: "Failed to update post.",
    };
  }
}

export async function setPostStatus(
  postId: string,
  status: PostStatus,
  publishedAt: string | null,
) {
  const existingPost = await getPostById(postId);

  if (!existingPost) {
    return {
      success: false as const,
      code: "NOT_FOUND" as const,
      message: "The post no longer exists.",
    };
  }

  return updatePost(postId, {
    title: existingPost.title,
    slug: existingPost.slug,
    status,
    publishedAt,
    contentHtml: existingPost.contentHtml,
  });
}

export async function deletePost(postId: string): Promise<DeletePostResult> {
  try {
    const { data: existingPost, error: existingPostError } = await supabase
      .from("posts")
      .select("id, slug, title, status, published_at, updated_at, created_at, content")
      .eq("id", Number(postId))
      .maybeSingle();

    if (existingPostError) {
      throw existingPostError;
    }

    if (!existingPost) {
      return {
        success: false,
        code: "NOT_FOUND",
        message: "The post no longer exists.",
      };
    }

    await deletePostMediaAssets(Number(postId));

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", Number(postId))
      .select("slug, status")
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      deletedPost: {
        slug: (data as { slug: string }).slug,
        status: (data as { status: PostStatus }).status,
      },
    };
  } catch {
    return {
      success: false,
      code: "DB_ERROR",
      message: "Failed to delete post.",
    };
  }
}

export async function getPostById(postId: string): Promise<PostDetail | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, created_at, content")
    .eq("id", Number(postId))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapPostRow(data as PostRow) : null;
}
