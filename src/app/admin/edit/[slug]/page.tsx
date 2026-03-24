import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPostBySlug } from "@/lib/posts";
import PostEditor from "../../components/PostEditor";

function EditPostPageFallback() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div>
        <div className="h-7 w-32 rounded bg-neutral-900" />
        <div className="mt-3 h-4 w-40 rounded bg-neutral-950" />
      </div>

      <div className="space-y-6">
        <div className="h-16 rounded border border-neutral-900 bg-neutral-950" />
        <div className="h-12 rounded border border-neutral-900 bg-neutral-950" />
        <div className="h-80 rounded border border-neutral-900 bg-neutral-950" />
      </div>
    </div>
  );
}

async function EditPostContent({ slug }: { slug: string }) {
  await connection();
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-lg text-neutral-200 font-medium tracking-tight">Edit Post</h2>
        <p className="text-neutral-500 text-sm mt-1 font-mono">/{post.slug}</p>
      </div>
      <PostEditor post={post} />
    </div>
  );
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<EditPostPageFallback />}>
      {params.then(({ slug }) => (
        <EditPostContent slug={slug} />
      ))}
    </Suspense>
  );
}
