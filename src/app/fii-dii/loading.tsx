import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function FiiDiiLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <SkeletonLoader lines={2} height="h-5" widths={["w-48", "w-96"]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <SkeletonLoader lines={2} height="h-4" widths={["w-24", "w-16"]} />
          </div>
        ))}
      </div>
      <div className="card">
        <SkeletonLoader lines={1} height="h-5" widths={["w-48"]} className="mb-4" />
        <div className="h-48 animate-pulse rounded-md bg-slate-200/80" />
      </div>
    </div>
  );
}
