import PostEditor from "../components/PostEditor";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-lg text-neutral-200 font-medium tracking-tight">New Post</h2>
        <p className="text-neutral-500 text-sm mt-1">Start writing something new.</p>
      </div>
      <PostEditor />
    </div>
  );
}
