import { PageWrapper } from "@/components/PageWrapper";

export default function BlogPostLoading() {
  return (
    <PageWrapper className="flex flex-col flex-1">
      <div className="flex-1 mt-8 md:mt-16 animate-pulse">
        <div className="mb-12 border-b border-neutral-900 pb-8">
          <div className="h-10 w-3/4 max-w-xl rounded bg-neutral-900" />
          <div className="mt-4 h-4 w-28 rounded bg-neutral-900" />
        </div>

        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-neutral-950" />
          <div className="h-4 w-11/12 rounded bg-neutral-950" />
          <div className="h-4 w-10/12 rounded bg-neutral-950" />
          <div className="h-4 w-full rounded bg-neutral-950" />
          <div className="h-4 w-9/12 rounded bg-neutral-950" />
        </div>
      </div>
    </PageWrapper>
  );
}
