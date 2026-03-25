import { z } from "zod";
import { normalizeSlug } from "@/lib/slug";
import type { PostFieldErrors, PostStatus, PostUpsertInput } from "@/types/blog";

export const MAX_CONTENT_LENGTH = 1_000_000;

const postStatusSchema = z.enum(["draft", "published"]);

const postInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(180, "Title is too long."),
    slug: z.string(),
    status: postStatusSchema,
    publishedAt: z.string().nullable(),
    contentHtml: z
      .string()
      .trim()
      .min(1, "Content is required.")
      .max(MAX_CONTENT_LENGTH, "Content is too large."),
  })
  .superRefine((value, ctx) => {
    if (!value.slug) {
      ctx.addIssue({
        code: "custom",
        message: "Slug is required.",
        path: ["slug"],
      });
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) {
      ctx.addIssue({
        code: "custom",
        message: "Slug may only contain lowercase letters, numbers, and hyphens.",
        path: ["slug"],
      });
    }

    if (/(?:src|href)\s*=\s*['"]\s*data:/i.test(value.contentHtml)) {
      ctx.addIssue({
        code: "custom",
        message: "Inline data URLs are not allowed. Upload the file instead.",
        path: ["contentHtml"],
      });
    }

    if (value.status === "published") {
      if (!value.publishedAt) {
        ctx.addIssue({
          code: "custom",
          message: "Publish date is required for published posts.",
          path: ["publishedAt"],
        });
      } else if (Number.isNaN(new Date(value.publishedAt).getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Publish date is invalid.",
          path: ["publishedAt"],
        });
      }
    }

    if (value.publishedAt && Number.isNaN(new Date(value.publishedAt).getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Publish date is invalid.",
        path: ["publishedAt"],
      });
    }
  });

function toFieldErrors(error: z.ZodError): PostFieldErrors {
  const fieldErrors: PostFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof PostFieldErrors] = issue.message;
    }
  }

  if (!fieldErrors.form) {
    fieldErrors.form = "Please fix the highlighted fields.";
  }

  return fieldErrors;
}

export function validatePostInput(input: {
  title: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  contentHtml: string;
}) {
  const normalized = {
    ...input,
    title: input.title.trim(),
    slug: normalizeSlug(input.slug),
    contentHtml: input.contentHtml.trim(),
  };

  const result = postInputSchema.safeParse(normalized);

  if (!result.success) {
    return {
      success: false as const,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  const data: PostUpsertInput = {
    title: result.data.title,
    slug: result.data.slug,
    status: result.data.status,
    publishedAt: result.data.status === "draft" ? result.data.publishedAt : result.data.publishedAt,
    contentHtml: result.data.contentHtml,
  };

  return {
    success: true as const,
    data,
  };
}
