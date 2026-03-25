"use client";

import { deletePostAction } from "@/app/admin/actions";
import type { PostStatus } from "@/types/blog";

export function DeleteButton({
  postId,
  slug,
  title,
  status,
  className,
}: {
  postId: string;
  slug: string;
  title: string;
  status: PostStatus;
  className?: string;
}) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(event) => {
        if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          className ??
          "text-sm text-neutral-700 transition-colors hover:text-red-400"
        }
      >
        Delete
      </button>
    </form>
  );
}
