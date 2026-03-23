import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import PostEditor from "../../components/PostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
