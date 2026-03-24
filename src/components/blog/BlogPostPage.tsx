import Link from "next/link";
import { PageWrapper } from "@/components/PageWrapper";
import { AdminAura } from "@/components/admin/AdminAura";
import { FadeInStagger, FadeInStaggerItem } from "@/components/animations/FadeInStagger";
import { sanitizeHtml } from "@/lib/sanitize";
import { BlogPost } from "@/types/blog";

interface BlogPostPageProps {
  post: BlogPost;
  backHref: string;
  backLabel: string;
  adminLabel?: string;
}

export function BlogPostPage({
  post,
  backHref,
  backLabel,
  adminLabel,
}: BlogPostPageProps) {
  return (
    <>
      {adminLabel ? <AdminAura label={adminLabel} /> : null}
      <PageWrapper className="flex flex-col flex-1">
        <FadeInStagger className="flex-1 mt-8 md:mt-16">
          <FadeInStaggerItem className="mb-12 border-b border-neutral-900 pb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-neutral-200 mb-4 tracking-tight">
              {post.title}
            </h1>
            <time className="text-neutral-500 font-mono text-sm">
              {post.date}
            </time>
          </FadeInStaggerItem>

          <FadeInStaggerItem className="space-y-6 text-neutral-400 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || "") }} />
          </FadeInStaggerItem>

          <FadeInStaggerItem className="mt-16 pb-8">
            <Link
              href={backHref}
              className="text-neutral-500 hover:text-neutral-300 transition-colors inline-block"
            >
              &larr;{" "}
              <span className="ml-1 border-b border-transparent hover:border-neutral-500 pb-0.5 transition-colors">
                {backLabel}
              </span>
            </Link>
          </FadeInStaggerItem>
        </FadeInStagger>
      </PageWrapper>
    </>
  );
}
