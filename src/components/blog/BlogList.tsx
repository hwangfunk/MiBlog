import { FadeInStagger, FadeInStaggerItem } from "@/components/animations/FadeInStagger";
import { BlogItem } from "@/components/blog/BlogItem";
import type { PostSummary } from "@/types/blog";

interface BlogListProps {
  posts: PostSummary[];
}

export const BlogList = ({ posts }: BlogListProps) => {
  return (
    <FadeInStagger className="relative flex flex-1 flex-col gap-2">
      {posts.map((post) => (
        <FadeInStaggerItem key={post.id}>
          <BlogItem post={post} />
        </FadeInStaggerItem>
      ))}
    </FadeInStagger>
  );
};
