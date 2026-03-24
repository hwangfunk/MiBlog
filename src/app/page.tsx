import { PageWrapper } from "@/components/PageWrapper";
import { BlogList } from "@/components/blog/BlogList";
import { getPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();

  return (
    <PageWrapper className="flex flex-col flex-1 h-full">
      <header className="mb-16 mt-8">
        <h1 className="text-xl text-neutral-200 font-medium tracking-tight mb-2">qanx._.minhhh blog</h1>
        <p className="text-neutral-500 text-[13px] tracking-[0.15em] font-light italic mt-2 opacity-75">
          "just raw !"
        </p>
      </header>
      
      <BlogList posts={posts} />
    </PageWrapper>
  );
}
