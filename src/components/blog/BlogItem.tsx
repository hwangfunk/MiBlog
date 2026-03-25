import Link from "next/link";
import { formatPublishedDate } from "@/lib/dates";
import type { PostSummary } from "@/types/blog";

interface BlogItemProps {
  post: PostSummary;
}

export const BlogItem = ({ post }: BlogItemProps) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={false}
      className="group relative flex flex-col py-5 transition-all duration-500 md:flex-row md:items-center md:justify-between"
    >
      <div className="inline-block">
        <span className="text-sm text-neutral-400 transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] sm:text-base">
          {post.title}
        </span>
      </div>
      <span className="mt-2 whitespace-nowrap font-mono text-xs text-neutral-500 transition-all duration-300 group-hover:text-neutral-200 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] sm:text-sm md:mt-0">
        {formatPublishedDate(post.publishedAt)}
      </span>
      <span className="absolute bottom-0 left-0 h-[1.5px] w-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500 ease-out group-hover:w-full" />
    </Link>
  );
};
