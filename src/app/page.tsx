import type { Metadata } from "next";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogList } from "@/components/blog/BlogList";
import { listPublishedPosts } from "@/lib/posts";
import { SITE_BRAND_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_BRAND_NAME,
  },
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const posts = await listPublishedPosts();

  return (
    <PageWrapper className="flex h-full flex-1 flex-col">
      <header className="mb-16 mt-8">
        <h1 className="mb-2 text-xl font-medium tracking-tight text-neutral-200">
          qanx._.minhhh blog
        </h1>
        <p className="mt-2 text-[13px] font-light italic tracking-[0.15em] text-neutral-500 opacity-75">
          &ldquo;just raw !&rdquo;
        </p>
      </header>

      <BlogList posts={posts} />
    </PageWrapper>
  );
}
