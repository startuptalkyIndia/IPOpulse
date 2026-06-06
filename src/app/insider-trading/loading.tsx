import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function InsiderTradingLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <SkeletonLoader lines={2} height="h-5" widths={["w-64", "w-full"]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <SkeletonLoader lines={2} height="h-4" widths={["w-24", "w-16"]} />
          </div>
        ))}
      </div>
      {[0, 1].map((section) => (
        <div key={section} className="space-y-2">
          <SkeletonLoader lines={1} height="h-5" widths={["w-56"]} />
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="border-b border-gray-100 px-3 py-3">
                <SkeletonLoader lines={1} height="h-3" widths={["w-full"]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
