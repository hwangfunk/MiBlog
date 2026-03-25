"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <h2 className="text-lg font-medium tracking-tight text-neutral-200">
        Something went wrong
      </h2>
      <p className="max-w-md text-center text-sm text-neutral-500">
        An unexpected error interrupted the request. Try again, and if it keeps
        happening, use the request reference below for tracing.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-neutral-700">Request: {error.digest}</p>
      ) : null}
      <button
        onClick={reset}
        className="border-b border-transparent pb-0.5 text-sm text-neutral-400 transition-colors hover:border-cyan-400 hover:text-cyan-400"
      >
        Try again
      </button>
    </div>
  );
}
