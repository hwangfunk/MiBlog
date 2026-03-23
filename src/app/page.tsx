import { PageWrapper } from "@/components/PageWrapper";
import { BlogList } from "@/components/blog/BlogList";
import { getPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();

  return (
    <PageWrapper className="flex flex-col flex-1 h-full">
      <header className="mb-16 mt-8">
        <h1 className="text-xl text-neutral-200 font-medium mb-2 tracking-tight">qanx._.minhhh blog</h1>
        <p className="text-neutral-500 text-sm">for my own and somebody</p>
      </header>
      
      <BlogList posts={posts} />
    </PageWrapper>
  );
}
