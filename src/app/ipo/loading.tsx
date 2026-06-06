import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function IpoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg animate-pulse bg-slate-200/80 flex-shrink-0" />
            <SkeletonLoader lines={2} height="h-3" widths={["w-16", "w-8"]} />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      {[0, 1, 2].map((section) => (
        <div key={section} className="space-y-3">
          <SkeletonLoader lines={1} height="h-5" widths={["w-40"]} />
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-3">
              <SkeletonLoader lines={1} height="h-3" widths={["w-full"]} />
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="border-b border-gray-100 px-3 py-3">
                <SkeletonLoader lines={2} height="h-3" widths={["w-1/3", "w-1/4"]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
