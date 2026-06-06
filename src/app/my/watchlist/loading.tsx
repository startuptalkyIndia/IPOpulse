import { SkeletonLoader, SkeletonCard } from "@/components/shared/SkeletonLoader";

export default function WatchlistLoading() {
  return (
    <div className="space-y-6">
      <SkeletonLoader lines={1} height="h-7" widths={["w-40"]} />
      <section className="space-y-3">
        <SkeletonLoader lines={1} height="h-4" widths={["w-32"]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
