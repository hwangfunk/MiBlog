import { BlogItem } from "./BlogItem";
import { BlogPostSummary } from "@/types/blog";
import { FadeInStagger, FadeInStaggerItem } from "../animations/FadeInStagger";

interface BlogListProps {
  posts: BlogPostSummary[];
}

export const BlogList = ({ posts }: BlogListProps) => {
  return (
    <FadeInStagger className="flex flex-col gap-2 flex-1 relative">
      {posts.map((post) => (
        <FadeInStaggerItem key={post.slug}>
          <BlogItem post={post} />
        </FadeInStaggerItem>
      ))}
    </FadeInStagger>
  );
};
