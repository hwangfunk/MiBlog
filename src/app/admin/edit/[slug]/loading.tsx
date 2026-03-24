export default function EditPostLoading() {
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
