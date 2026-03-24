"use client";

import { deletePostAction } from "../actions";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="text-sm text-neutral-700 hover:text-red-400 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
