import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonLoader lines={1} height="h-7" widths={["w-48"]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <SkeletonLoader lines={2} height="h-4" widths={["w-16", "w-8"]} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="border-b border-gray-100 px-3 py-4">
            <SkeletonLoader lines={2} height="h-3" widths={["w-1/3", "w-1/2"]} />
          </div>
        ))}
      </div>
    </div>
  );
}
