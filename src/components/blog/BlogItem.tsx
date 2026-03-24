import Link from "next/link";
import { BlogPostSummary } from "@/types/blog";

interface BlogItemProps {
  post: BlogPostSummary;
}

export const BlogItem = ({ post }: BlogItemProps) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col md:flex-row md:justify-between md:items-center py-5 transition-all duration-500"
    >
      <div className="inline-block">
        <span className="text-neutral-400 transition-all duration-300 text-sm sm:text-base group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {post.title}
        </span>
      </div>
      <span className="text-neutral-500 text-xs sm:text-sm whitespace-nowrap mt-2 md:mt-0 font-mono transition-all duration-300 group-hover:text-neutral-200 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
        {post.date}
      </span>
      <span className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500 ease-out group-hover:w-full rounded-full"></span>
    </Link>
  );
};
