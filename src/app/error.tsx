'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-20">
      <h2 className="text-lg text-neutral-200 font-medium tracking-tight">
        Something went wrong
      </h2>
      <p className="text-neutral-500 text-sm text-center max-w-md">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="text-sm text-neutral-400 hover:text-cyan-400 transition-colors border-b border-transparent hover:border-cyan-400 pb-0.5"
      >
        Try again
      </button>
    </div>
  );
}
