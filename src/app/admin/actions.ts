"use server";

import { revalidatePath, updateTag } from "next/cache";
import { logAdminAuditEvent } from "@/lib/admin-audit";
import { getActionRequestContext } from "@/lib/admin-request";
import {
  getPublicCacheInvalidationPlan,
  getPublicPostCacheTag,
} from "@/lib/post-cache-plan";
import { createPost, deletePost, updatePost } from "@/lib/posts";
import { validatePostInput } from "@/lib/posts-validation";
import { requireAdminMutationSession } from "@/lib/session";
import type { PostMutationResult, PostStatus } from "@/types/blog";

function applyPublicCacheInvalidation(plan: ReturnType<typeof getPublicCacheInvalidationPlan>) {
  for (const tag of plan.tags) {
    updateTag(tag);
  }

  for (const path of plan.paths) {
    revalidatePath(path);
  }
}

function getPostIntentAuditEvent(previousStatus: PostStatus | undefined, nextStatus: PostStatus) {
  if (!previousStatus) {
    return nextStatus === "published" ? "post.published" : "post.created";
  }

  if (previousStatus === "draft" && nextStatus === "published") {
    return "post.published";
  }

  if (previousStatus === "published" && nextStatus === "draft") {
    return "post.unpublished";
  }

  return "post.updated";
}

export async function createOrUpdatePostAction(formData: FormData): Promise<PostMutationResult> {
  const requestContext = await getActionRequestContext();
  const auth = await requireAdminMutationSession();

  if (!auth.ok) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      error: auth.error,
      requestId: requestContext.correlationId,
    };
  }

  const postId = String(formData.get("id") ?? "").trim();
  const validated = validatePostInput({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    status: (String(formData.get("status") ?? "draft") as PostStatus),
    publishedAt: String(formData.get("publishedAt") ?? "").trim() || null,
    contentHtml: String(formData.get("content") ?? ""),
  });

  if (!validated.success) {
    return {
      success: false,
      code: "VALIDATION",
      error: "Please fix the highlighted fields.",
      fieldErrors: validated.fieldErrors,
      requestId: requestContext.correlationId,
    };
  }

  const result = postId
    ? await updatePost(postId, validated.data)
    : await createPost(validated.data);

  if (!result.success) {
    const error =
      result.code === "DUPLICATE_SLUG"
        ? "Slug already exists. Choose a different slug."
        : result.code === "NOT_FOUND"
          ? "The post no longer exists."
          : "Failed to save the post.";

    return {
      success: false,
      code: result.code,
      error,
      fieldErrors:
        result.code === "DUPLICATE_SLUG"
          ? { slug: "Slug already exists.", form: error }
          : { form: error },
      requestId: requestContext.correlationId,
    };
  }

  const cachePlan = getPublicCacheInvalidationPlan({
    previousSlug: result.previousPost?.slug,
    previousStatus: result.previousPost?.status,
    nextSlug: result.post.slug,
    nextStatus: result.post.status,
  });
  applyPublicCacheInvalidation(cachePlan);

  if (result.previousPost?.slug && result.previousPost.slug !== result.post.slug) {
    updateTag(getPublicPostCacheTag(result.previousPost.slug));
  }

  await logAdminAuditEvent({
    eventType: getPostIntentAuditEvent(result.previousPost?.status, result.post.status),
    success: true,
    requestContext,
    metadata: {
      postId: result.post.id,
      previousSlug: result.previousPost?.slug ?? null,
      nextSlug: result.post.slug,
      previousStatus: result.previousPost?.status ?? null,
      nextStatus: result.post.status,
    },
  });

  return {
    success: true,
    postId: result.post.id,
    nextSlug: result.post.slug,
    nextStatus: result.post.status,
    message:
      result.post.status === "published"
        ? "Post published successfully."
        : "Draft saved successfully.",
    requestId: requestContext.correlationId,
  };
}

export async function deletePostAction(formData: FormData) {
  const requestContext = await getActionRequestContext();
  const auth = await requireAdminMutationSession();

  if (!auth.ok) {
    throw new Error("Unauthorized");
  }

  const postId = String(formData.get("postId") ?? "").trim();

  if (!postId) {
    throw new Error("Missing post id");
  }

  const result = await deletePost(postId);

  if (!result.success) {
    throw new Error(result.message);
  }

  applyPublicCacheInvalidation(
    getPublicCacheInvalidationPlan({
      previousSlug: result.deletedPost.slug,
      previousStatus: result.deletedPost.status,
      nextSlug: result.deletedPost.slug,
      nextStatus: "draft",
    }),
  );

  await logAdminAuditEvent({
    eventType: "post.deleted",
    success: true,
    requestContext,
    metadata: {
      postId,
      slug: result.deletedPost.slug,
      status: result.deletedPost.status,
    },
  });
}
