import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-600">404</p>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-200">
          This post is no longer available
        </h1>
        <p className="max-w-lg text-sm text-neutral-500">
          The post may have been unpublished, removed, or its slug may have changed.
        </p>
      </div>

      <Link
        href="/"
        className="border-b border-transparent pb-0.5 text-sm text-neutral-300 transition-colors hover:border-cyan-400 hover:text-cyan-400"
      >
        Back to home
      </Link>
    </div>
  );
}
