import { PageWrapper } from "@/components/PageWrapper";

export default function AdminLoading() {
  return (
    <PageWrapper className="flex flex-col flex-1 h-full">
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <p className="text-neutral-600 text-sm animate-pulse">Loading admin...</p>
      </div>
    </PageWrapper>
  );
}
