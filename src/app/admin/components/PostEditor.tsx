"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createOrUpdatePostAction } from "@/app/admin/actions";
import { formatPublishedDate, fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/dates";
import { normalizeSlug } from "@/lib/slug";
import { sanitizeHtml } from "@/lib/sanitize";
import type { PostDetail, PostFieldErrors, PostStatus } from "@/types/blog";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(
  async () => {
    const { default: Quill } = await import("react-quill-new");
    return Quill;
  },
  {
    ssr: false,
    loading: () => (
      <p className="animate-pulse px-4 py-10 text-neutral-500">Loading editor...</p>
    ),
  },
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const SAVE_FLASH_STORAGE_KEY = "post-editor-save-flash";
const SAVE_FLASH_TTL_MS = 5000;
const SAVE_SUCCESS_DURATION_MS = 1600;
const SAVE_ERROR_DURATION_MS = 3200;

type SaveOverlayTone = "saving" | "saved" | "error";
type SubmitIntent =
  | "save-draft"
  | "publish"
  | "update-published"
  | "unpublish";

interface SaveOverlayState {
  tone: SaveOverlayTone;
  message: string;
}

interface QuillEditorHandle {
  getSelection: (focus?: boolean) => { index: number } | null;
  insertEmbed: (index: number, type: string, value: string) => void;
  setSelection: (index: number) => void;
  root?: HTMLElement | null;
}

function getDefaultPublishedAtLocal() {
  return toDateTimeLocalValue(new Date().toISOString());
}

function getSubmitIntentFromStatus(status: PostStatus): SubmitIntent {
  return status === "published" ? "update-published" : "save-draft";
}

function getNextStatusFromIntent(intent: SubmitIntent): PostStatus {
  return intent === "save-draft" || intent === "unpublish" ? "draft" : "published";
}

function getOverlayMessage(intent: SubmitIntent) {
  switch (intent) {
    case "publish":
      return "Publishing post...";
    case "update-published":
      return "Updating published post...";
    case "unpublish":
      return "Moving post back to draft...";
    default:
      return "Saving draft...";
  }
}

function getSuccessMessage(status: PostStatus) {
  return status === "published"
    ? "Published changes are now live."
    : "Draft saved successfully.";
}

function getSnapshot({
  title,
  slug,
  content,
  status,
  publishedAtLocal,
}: {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  publishedAtLocal: string;
}) {
  return JSON.stringify({
    title,
    slug,
    content,
    status,
    publishedAtLocal,
  });
}

export default function PostEditor({ post }: { post?: PostDetail }) {
  const router = useRouter();
  const pathname = usePathname();
  const quillRef = useRef<{
    getEditor?: () => QuillEditorHandle;
  } | null>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef(
    getSnapshot({
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      content: post?.contentHtml ?? "",
      status: post?.status ?? "draft",
      publishedAtLocal: post?.publishedAt
        ? toDateTimeLocalValue(post.publishedAt)
        : "",
    }),
  );
  const [content, setContent] = useState(post?.contentHtml ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [publishedAtLocal, setPublishedAtLocal] = useState(
    post?.publishedAt ? toDateTimeLocalValue(post.publishedAt) : getDefaultPublishedAtLocal(),
  );
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(post?.slug));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [overlayState, setOverlayState] = useState<SaveOverlayState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PostFieldErrors>({});
  const [requestId, setRequestId] = useState<string | null>(null);
  const [, setSubmitIntent] = useState<SubmitIntent>(
    getSubmitIntentFromStatus(post?.status ?? "draft"),
  );
  const [quillMountVersion, setQuillMountVersion] = useState(0);

  const clearOverlayTimer = useCallback(() => {
    if (overlayTimeoutRef.current !== null) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }
  }, []);

  const disableEditorSpellcheck = useCallback((root?: HTMLElement | null) => {
    if (!root) {
      return;
    }

    root.setAttribute("spellcheck", "false");
    root.setAttribute("autocorrect", "off");
    root.setAttribute("autocapitalize", "off");
    root.setAttribute("data-gramm", "false");
  }, []);

  const attachQuillRef = useCallback(
    (instance: { getEditor?: () => QuillEditorHandle } | null) => {
      quillRef.current = instance;
      if (instance) {
        setQuillMountVersion((current) => current + 1);
      }
    },
    [],
  );

  const showOverlay = useCallback(
    (tone: SaveOverlayTone, message: string, durationMs?: number) => {
      clearOverlayTimer();
      setOverlayState({ tone, message });

      if (durationMs) {
        overlayTimeoutRef.current = setTimeout(() => {
          setOverlayState(null);
          overlayTimeoutRef.current = null;
        }, durationMs);
      }
    },
    [clearOverlayTimer],
  );

  const resetSaveFeedback = useCallback(() => {
    clearOverlayTimer();
    setOverlayState(null);
    setFieldErrors({});
    setRequestId(null);
  }, [clearOverlayTimer]);

  const currentSnapshot = useMemo(
    () =>
      getSnapshot({
        title,
        slug,
        content,
        status,
        publishedAtLocal: status === "published" ? publishedAtLocal : "",
      }),
    [content, publishedAtLocal, slug, status, title],
  );

  const isDirty = currentSnapshot !== lastSavedSnapshotRef.current;
  const publishDateForPreview =
    status === "published"
      ? fromDateTimeLocalValue(publishedAtLocal) ?? null
      : null;

  useEffect(() => {
    return () => {
      clearOverlayTimer();
    };
  }, [clearOverlayTimer]);

  useEffect(() => {
    if (!quillMountVersion) {
      return;
    }

    try {
      disableEditorSpellcheck(quillRef.current?.getEditor?.()?.root);
    } catch {
      // Quill may throw "Accessing non-instantiated editor" if not fully ready yet
    }
  }, [disableEditorSpellcheck, quillMountVersion]);

  useEffect(() => {
    const rawFlash = window.sessionStorage.getItem(SAVE_FLASH_STORAGE_KEY);
    if (!rawFlash) {
      return;
    }

    window.sessionStorage.removeItem(SAVE_FLASH_STORAGE_KEY);

    try {
      const flash = JSON.parse(rawFlash) as { path?: string; expiresAt?: number };
      if (
        flash.path === pathname &&
        typeof flash.expiresAt === "number" &&
        flash.expiresAt > Date.now()
      ) {
        showOverlay("saved", "Draft saved successfully.", SAVE_SUCCESS_DURATION_MS);
      }
    } catch {
      window.sessionStorage.removeItem(SAVE_FLASH_STORAGE_KEY);
    }
  }, [pathname, showOverlay]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleTitleChange = (value: string) => {
    resetSaveFeedback();
    setTitle(value);

    if (!isSlugEdited) {
      setSlug(normalizeSlug(value));
    }
  };

  async function handleSubmit(formData: FormData) {
    resetSaveFeedback();
    const intent = (String(
      formData.get("intent") ?? getSubmitIntentFromStatus(status),
    ) as SubmitIntent);
    setSubmitIntent(intent);
    const nextStatus = getNextStatusFromIntent(intent);
    const nextPublishedAtLocal =
      nextStatus === "published"
        ? publishedAtLocal || getDefaultPublishedAtLocal()
        : publishedAtLocal;
    const nextPublishedAtIso =
      nextStatus === "published"
        ? fromDateTimeLocalValue(nextPublishedAtLocal)
        : fromDateTimeLocalValue(nextPublishedAtLocal);

    showOverlay("saving", getOverlayMessage(intent));
    setIsSubmitting(true);
    setPublishedAtLocal(nextPublishedAtLocal);
    formData.set("content", content);
    formData.set("status", nextStatus);
    formData.set("publishedAt", nextPublishedAtIso ?? "");

    try {
      const result = await createOrUpdatePostAction(formData);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setRequestId(result.requestId);
        showOverlay("error", result.error, SAVE_ERROR_DURATION_MS);
        return;
      }

      setSlug(result.nextSlug);
      setStatus(result.nextStatus);
      setRequestId(result.requestId);

      const nextSnapshot = getSnapshot({
        title: title.trim(),
        slug: result.nextSlug,
        content,
        status: result.nextStatus,
        publishedAtLocal: result.nextStatus === "published" ? nextPublishedAtLocal : "",
      });
      lastSavedSnapshotRef.current = nextSnapshot;

      const nextEditorPath = `/admin/edit/${result.nextSlug}`;
      const shouldNavigate = pathname !== nextEditorPath;

      if (shouldNavigate) {
        window.sessionStorage.setItem(
          SAVE_FLASH_STORAGE_KEY,
          JSON.stringify({
            path: nextEditorPath,
            expiresAt: Date.now() + SAVE_FLASH_TTL_MS,
          }),
        );
        router.replace(nextEditorPath, { scroll: false });
        return;
      }

      showOverlay("saved", getSuccessMessage(result.nextStatus), SAVE_SUCCESS_DURATION_MS);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to save post.";
      showOverlay("error", message, SAVE_ERROR_DURATION_MS);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/jpeg,image/png,image/gif,image/webp,image/avif");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        alert("Image is too large. Maximum 20MB before compression.");
        return;
      }

      setIsUploading(true);
      try {
        const { compressImage } = await import("@/lib/compress-image");
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressed);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as {
          error?: string;
          contentUrl?: string;
        };

        if (!response.ok || !payload.contentUrl) {
          throw new Error(payload.error || "Upload failed");
        }

        const editor = quillRef.current?.getEditor?.();
        if (editor) {
          const range = editor.getSelection(true) ?? { index: content.length };
          editor.insertEmbed(range.index, "image", payload.contentUrl);
          editor.setSelection(range.index + 1);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Upload failed";
        alert(`Image upload failed: ${message}`);
      } finally {
        setIsUploading(false);
      }
    };
  }, [content.length]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    [handleImageUpload],
  );

  const primaryActionLabel =
    status === "published" ? "Update published post" : "Save draft";

  return (
    <form action={handleSubmit} className="flex w-full flex-col gap-8">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-[1.75rem] border border-neutral-800/60 bg-neutral-950/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
                status === "published"
                  ? "border-emerald-500/30 text-emerald-300"
                  : "border-amber-500/30 text-amber-300"
              }`}
            >
              {status}
            </span>
            <span className="text-xs font-mono text-neutral-600">
              {status === "published"
                ? formatPublishedDate(publishDateForPreview)
                : "Private draft"}
            </span>
          </div>
          {isDirty ? (
            <span className="text-xs font-medium text-amber-300">Unsaved changes</span>
          ) : null}
        </div>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Title</span>
          <input
            type="text"
            name="title"
            value={title}
            disabled={isSubmitting || isUploading}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            placeholder="Post title"
            className="w-full border-b border-neutral-800 bg-transparent px-0 py-3 text-3xl font-medium tracking-tight text-neutral-100 transition-colors placeholder:text-neutral-800 focus:border-neutral-600 focus:outline-none md:text-[2.5rem]"
          />
          {fieldErrors.title ? (
            <span className="text-sm text-red-300">{fieldErrors.title}</span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
              Slug
            </span>
            <input
              type="text"
              name="slug"
              value={slug}
              disabled={isSubmitting || isUploading}
              onChange={(event) => {
                resetSaveFeedback();
                setIsSlugEdited(true);
                setSlug(event.target.value);
              }}
              required
              placeholder="url-friendly-slug"
              className="w-full rounded-2xl border border-neutral-800/80 bg-black/20 px-4 py-3 font-mono text-sm text-neutral-300 transition-colors placeholder:text-neutral-700 focus:border-neutral-600 focus:outline-none"
            />
            {fieldErrors.slug ? (
              <span className="text-sm text-red-300">{fieldErrors.slug}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
              Publish at
            </span>
            <input
              type="datetime-local"
              value={publishedAtLocal}
              disabled={isSubmitting || isUploading}
              onChange={(event) => {
                resetSaveFeedback();
                setPublishedAtLocal(event.target.value);
              }}
              className="w-full rounded-2xl border border-neutral-800/80 bg-black/20 px-4 py-3 font-mono text-sm text-neutral-300 transition-colors focus:border-neutral-600 focus:outline-none"
            />
            {fieldErrors.publishedAt ? (
              <span className="text-sm text-red-300">{fieldErrors.publishedAt}</span>
            ) : null}
          </label>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="border-b border-neutral-800/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`relative px-4 py-2.5 text-sm transition-colors duration-200 ${
                activeTab === "write"
                  ? "text-neutral-200"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              Write
              {activeTab === "write" ? (
                <span className="animate-tab-slide absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`relative px-4 py-2.5 text-sm transition-colors duration-200 ${
                activeTab === "preview"
                  ? "text-neutral-200"
                  : "text-neutral-600 hover:text-neutral-400"
              }`}
            >
              Preview
              {activeTab === "preview" ? (
                <span className="animate-tab-slide absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto min-h-[500px] w-full max-w-3xl">
        <div className={activeTab === "write" ? "block" : "hidden"}>
          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-800/60 bg-neutral-950/40">
            <div className="react-quill-dark editor-blog-match relative">
              {isUploading ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded bg-neutral-950/80">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <span className="text-sm text-neutral-400">Uploading image...</span>
                  </div>
                </div>
              ) : null}
              <ReactQuill
                ref={attachQuillRef}
                theme="snow"
                value={content}
                readOnly={isSubmitting || isUploading}
                onChange={(value: string) => {
                  resetSaveFeedback();
                  setContent(value);
                }}
                modules={modules}
                placeholder="Start writing..."
                className="overflow-x-hidden rounded-none border-0 bg-transparent text-neutral-400"
              >
                <div
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-gramm="false"
                />
              </ReactQuill>
            </div>
          </div>
          {fieldErrors.contentHtml ? (
            <p className="mt-3 text-sm text-red-300">{fieldErrors.contentHtml}</p>
          ) : null}
        </div>

        <div className={activeTab === "preview" ? "block" : "hidden"}>
          <div className="rounded-[1.75rem] border border-neutral-800/60 bg-neutral-950/30 py-7 sm:py-8">
            <div className="blog-content-shell mb-12 border-b border-neutral-900 pb-8">
              <h1 className="mb-4 text-2xl font-medium tracking-tight text-neutral-200 md:text-3xl">
                {title || <span className="italic text-neutral-700">Untitled</span>}
              </h1>
              <time className="font-mono text-sm text-neutral-500">
                {status === "published"
                  ? formatPublishedDate(publishDateForPreview)
                  : "Draft"}
              </time>
            </div>

            {content ? (
              <div className="blog-content-shell text-sm leading-relaxed text-neutral-400 md:text-base">
                <div
                  className="blog-rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                />
              </div>
            ) : (
              <div className="blog-content-shell text-sm leading-relaxed text-neutral-400 md:text-base">
                <div className="blog-rich-text">
                  <p className="italic text-neutral-700">Nothing here yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-8">
        {fieldErrors.form ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
            <p>{fieldErrors.form}</p>
            {requestId ? (
              <p className="mt-1 font-mono text-xs text-red-200/70">Request: {requestId}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-neutral-800/60 bg-neutral-950/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              if (isDirty && !confirm("Discard unsaved changes and return to the admin list?")) {
                return;
              }
              router.push("/admin");
            }}
            disabled={isSubmitting || isUploading}
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-300 disabled:opacity-40"
          >
            Back
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {!isDirty && post?.id ? (
              <span className="text-xs font-medium text-neutral-600">Saved</span>
            ) : null}
            {status === "published" ? (
              <button
                type="submit"
                name="intent"
                value="unpublish"
                disabled={isSubmitting || isUploading}
                className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:opacity-40"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={isSubmitting || isUploading}
                className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm text-emerald-200 transition-colors hover:border-emerald-400 hover:text-emerald-100 disabled:opacity-40"
              >
                Publish
              </button>
            )}

            <button
              type="submit"
              name="intent"
              value={status === "published" ? "update-published" : "save-draft"}
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-300 disabled:opacity-40"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {isSubmitting ? "Working..." : primaryActionLabel}
            </button>
          </div>
        </div>
      </div>

      {overlayState ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div
            role={overlayState.tone === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`w-full max-w-sm rounded-2xl border px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${
              overlayState.tone === "error"
                ? "border-red-500/30 bg-neutral-950 text-red-300"
                : overlayState.tone === "saved"
                  ? "border-emerald-500/30 bg-neutral-950 text-emerald-300"
                  : "border-cyan-500/30 bg-neutral-950 text-cyan-200"
            }`}
          >
            <div className="flex items-center gap-4">
              {overlayState.tone === "saving" ? (
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : overlayState.tone === "saved" ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                  ✓
                </span>
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                  !
                </span>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-100">
                  {overlayState.tone === "saving"
                    ? "Saving post"
                    : overlayState.tone === "saved"
                      ? "Post saved"
                      : "Save failed"}
                </p>
                <p className="text-sm leading-6 text-current/90">{overlayState.message}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
