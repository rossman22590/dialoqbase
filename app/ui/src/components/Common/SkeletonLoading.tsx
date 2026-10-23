import { Skeleton } from "../ui";

const SkeletonBlock = ({ delay }: { delay: number }) => (
  <div className="animate-fade-in space-y-3" style={{ animationDelay: `${delay}ms` }}>
    <Skeleton className="h-5 w-2/5" />
    <div className="space-y-2.5 pt-1">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-11/12" />
      <Skeleton className="h-3.5 w-3/5" />
    </div>
  </div>
);

export const SkeletonLoading = ({ className = "mt-6" }: { className?: string }) => {
  return (
    <div className={className} role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="space-y-8">
        <SkeletonBlock delay={0} />
        <SkeletonBlock delay={80} />
      </div>
    </div>
  );
};
