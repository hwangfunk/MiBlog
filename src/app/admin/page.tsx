import Link from "next/link";
import { listPosts } from "@/lib/posts";
import { DeleteButton } from "./components/DeleteButton";

export default async function AdminPage() {
  const posts = await listPosts();

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-800/50">
        <p className="text-neutral-500 text-sm">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
        <Link
          href="/admin/new"
          className="text-sm text-neutral-400 hover:text-cyan-400 transition-colors"
        >
          + New post
        </Link>
      </div>

      {/* Post list */}
      <div className="flex flex-col">
        {posts.length === 0 ? (
          <p className="text-neutral-500 py-16 text-center">
            No posts yet. Start writing.
          </p>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.slug}
              className={`group relative flex justify-between items-center py-5 ${i !== posts.length - 1 ? 'border-b border-neutral-800/40' : ''
                }`}
            >
              {/* Eye icon for view — positioned at the start of the title */}
              <Link
                href={`/blog/${post.slug}?from=admin`}
                className="mr-3 shrink-0 text-neutral-700 hover:text-cyan-400 transition-colors"
                title="Preview post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>

              <Link
                href={`/admin/edit/${post.slug}`}
                className="flex-1 flex flex-col md:flex-row md:justify-between md:items-center"
              >
                <span className="text-neutral-400 text-sm sm:text-base group-hover:text-neutral-200 transition-colors duration-300">
                  {post.title}
                </span>
                <span className="text-neutral-600 text-xs sm:text-sm font-mono mt-1 md:mt-0">
                  {post.date}
                </span>
              </Link>

              {/* Actions — edit & delete */}
              <div className="flex items-center gap-5 ml-6 shrink-0">
                <Link
                  href={`/admin/edit/${post.slug}`}
                  className="text-sm text-neutral-700 hover:text-neutral-400 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton slug={post.slug} title={post.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
