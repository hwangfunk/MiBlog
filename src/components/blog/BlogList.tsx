"use client";

import { BlogItem } from "./BlogItem";
import { BlogPost } from "@/types/blog";
import { FadeInStagger, FadeInStaggerItem } from "../animations/FadeInStagger";

interface BlogListProps {
  posts: BlogPost[];
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
