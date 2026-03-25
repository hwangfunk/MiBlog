export type PostStatus = "draft" | "published";

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface PostDetail extends PostSummary {
  contentHtml: string;
}

export interface PostUpsertInput {
  title: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  contentHtml: string;
}

export interface PostFieldErrors {
  title?: string;
  slug?: string;
  publishedAt?: string;
  contentHtml?: string;
  form?: string;
}

export type PostMutationErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "DUPLICATE_SLUG"
  | "DB_ERROR";

export type PostMutationResult =
  | {
      success: true;
      postId: string;
      nextSlug: string;
      nextStatus: PostStatus;
      message: string;
      requestId: string;
    }
  | {
      success: false;
      code: PostMutationErrorCode;
      error: string;
      fieldErrors?: PostFieldErrors;
      requestId: string;
    };

export interface AdminListGroups {
  drafts: PostSummary[];
  published: PostSummary[];
}
