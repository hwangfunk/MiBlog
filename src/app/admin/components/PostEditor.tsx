"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/types/blog";
import { createOrUpdatePostAction } from "../actions";
import { sanitizeHtml } from "@/lib/sanitize";
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill — forwardRef needed to pass ref through dynamic()
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  {
    ssr: false,
    loading: () => <p className="text-neutral-500 py-10 px-4 animate-pulse">Loading editor...</p>,
  }
) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function PostEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ReactQuill doesn't export a proper ref type
  const quillRef = useRef<any>(null);
  const [content, setContent] = useState(post?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [title, setTitle] = useState(post?.title || "");
  const [date, setDate] = useState(
    post?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.append("content", content);

    const result = await createOrUpdatePostAction(formData);

    // If we get here, redirect didn't fire → there was a validation error
    if (result && !result.success) {
      setIsSubmitting(false);
      alert(result.error || "Error saving post.");
    }
  }

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp,image/avif');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        alert('Image is too large. Maximum 20MB.');
        return;
      }

      setIsUploading(true);
      try {
        // Compress client-side
        const { compressImage } = await import('@/lib/compress-image');
        const compressed = await compressImage(file);

        // Upload to server
        const formData = new FormData();
        formData.append('file', compressed);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }

        const { url } = await res.json();

        // Insert image at cursor position
        const editor = quillRef.current?.getEditor?.();
        if (editor) {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', url);
          editor.setSelection(range.index + 1);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        alert('Image upload failed: ' + message);
      } finally {
        setIsUploading(false);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  return (
    <form action={handleSubmit} className="flex flex-col gap-8 w-full">
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      {post?.slug && <input type="hidden" name="originalSlug" value={post.slug} />}

      {/* Metadata fields — styled to match blog post header */}
      <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <label className="flex flex-col gap-2">
          <span className="text-xs text-neutral-600 uppercase tracking-widest">Title</span>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Your post title"
            className="py-3 px-0 w-full bg-transparent border-b border-neutral-800 text-2xl md:text-3xl font-medium text-neutral-200 tracking-tight focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-800"
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-6">
          <label className="flex flex-col gap-2 flex-1">
            <span className="text-xs text-neutral-600 uppercase tracking-widest">Slug</span>
            <input
              type="text"
              name="slug"
              defaultValue={post?.slug}
              required
              placeholder="url-friendly-slug"
              className="py-2.5 px-0 w-full bg-transparent border-b border-neutral-800 text-neutral-400 font-mono text-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-800"
            />
          </label>

          <label className="flex flex-col gap-2 sm:w-52">
            <span className="text-xs text-neutral-600 uppercase tracking-widest">Date</span>
            <input
              type="text"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              placeholder="Mar 24, 2026"
              className="py-2.5 px-0 w-full bg-transparent border-b border-neutral-800 text-neutral-500 font-mono text-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-800"
            />
          </label>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-1 border-b border-neutral-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`relative px-4 py-2.5 text-sm transition-colors duration-200 ${
              activeTab === 'write'
                ? 'text-neutral-200'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            Write
            {activeTab === 'write' && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400 animate-tab-slide" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`relative px-4 py-2.5 text-sm transition-colors duration-200 ${
              activeTab === 'preview'
                ? 'text-neutral-200'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            Preview
            {activeTab === 'preview' && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400 animate-tab-slide" />
            )}
          </button>
        </div>
      </div>

      {/* Write / Preview panels */}
      <div className="max-w-3xl mx-auto w-full min-h-[500px]">
        {/* Write tab */}
        <div className={activeTab === 'write' ? 'block' : 'hidden'}>
          <div className="react-quill-dark editor-blog-match relative">
            {isUploading && (
              <div className="absolute inset-0 z-50 bg-neutral-950/80 flex items-center justify-center rounded">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-neutral-400">Uploading image...</span>
                </div>
              </div>
            )}
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start writing your story..."
              className="bg-transparent text-neutral-400 rounded-none border-0 overflow-x-hidden"
            />
          </div>
        </div>

        {/* Preview tab — exact blog post rendering */}
        <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
          <div className="blog-preview-container">
            {/* Post header preview */}
            <div className="mb-12 border-b border-neutral-900 pb-8">
              <h1 className="text-2xl md:text-3xl font-medium text-neutral-200 mb-4 tracking-tight">
                {title || <span className="text-neutral-700 italic">Untitled</span>}
              </h1>
              <time className="text-neutral-500 font-mono text-sm">
                {date}
              </time>
            </div>

            {/* Post content preview */}
            <div className="space-y-6 text-neutral-400 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
              ) : (
                <p className="text-neutral-700 italic">Nothing to preview yet. Start writing in the Write tab.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-6 pb-8 max-w-3xl mx-auto w-full">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="text-sm text-neutral-300 hover:text-cyan-400 transition-colors disabled:opacity-40 border-b border-transparent hover:border-cyan-400 pb-0.5"
        >
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
}
