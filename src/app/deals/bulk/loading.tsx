import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function BulkDealsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <SkeletonLoader lines={2} height="h-5" widths={["w-40", "w-full"]} />
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-3">
          <SkeletonLoader lines={1} height="h-3" widths={["w-full"]} />
        </div>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div key={row} className="border-b border-gray-100 px-3 py-3">
            <SkeletonLoader lines={1} height="h-3" widths={["w-full"]} />
          </div>
        ))}
      </div>
    </div>
  );
}
