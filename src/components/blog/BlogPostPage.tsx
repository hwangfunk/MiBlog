import Link from "next/link";
import { FadeInStagger, FadeInStaggerItem } from "@/components/animations/FadeInStagger";
import { AdminAura } from "@/components/admin/AdminAura";
import { PageWrapper } from "@/components/PageWrapper";
import { formatPublishedDate } from "@/lib/dates";
import { sanitizeHtmlForRender } from "@/lib/sanitize-server";
import type { PostDetail } from "@/types/blog";

interface BlogPostPageProps {
  post: PostDetail;
  backHref: string;
  backLabel: string;
  adminLabel?: string;
  notice?: string;
}

export function BlogPostPage({
  post,
  backHref,
  backLabel,
  adminLabel,
  notice,
}: BlogPostPageProps) {
  const sanitizedHtml = sanitizeHtmlForRender(post.contentHtml);

  return (
    <>
      {adminLabel ? <AdminAura label={adminLabel} /> : null}
      <PageWrapper className="flex flex-1 flex-col">
        <FadeInStagger className="mt-8 flex-1 md:mt-16">
          {notice ? (
            <FadeInStaggerItem className="mb-8 blog-content-shell">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100/80">
                {notice}
              </div>
            </FadeInStaggerItem>
          ) : null}

          <FadeInStaggerItem className="blog-content-shell mb-12 border-b border-neutral-900 pb-8">
            <h1 className="mb-4 text-2xl font-medium tracking-tight text-neutral-200 md:text-3xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-neutral-500">
              <time>{formatPublishedDate(post.publishedAt)}</time>
              {adminLabel ? (
                <span className="rounded-full border border-neutral-800 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                  {post.status}
                </span>
              ) : null}
            </div>
          </FadeInStaggerItem>

          <FadeInStaggerItem className="blog-content-shell text-sm leading-relaxed text-neutral-400 md:text-base">
            <div className="blog-rich-text" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          </FadeInStaggerItem>

          <FadeInStaggerItem className="blog-content-shell mt-16 pb-8">
            <Link
              href={backHref}
              className="inline-block text-neutral-500 transition-colors hover:text-neutral-300"
            >
              &larr;{" "}
              <span className="ml-1 border-b border-transparent pb-0.5 transition-colors hover:border-neutral-500">
                {backLabel}
              </span>
            </Link>
          </FadeInStaggerItem>
        </FadeInStagger>
      </PageWrapper>
    </>
  );
}
