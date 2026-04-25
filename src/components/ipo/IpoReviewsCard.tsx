import type { IpoReview } from "@prisma/client";
import { ThumbsUp, ThumbsDown, Minus, Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const recoMeta: Record<string, { label: string; cls: string; icon: typeof ThumbsUp }> = {
  subscribe: { label: "Subscribe", cls: "bg-green-100 text-green-800", icon: ThumbsUp },
  subscribe_long: { label: "Subscribe (Long-term)", cls: "bg-green-100 text-green-800", icon: ThumbsUp },
  subscribe_listing: { label: "Subscribe (Listing gain)", cls: "bg-blue-100 text-blue-800", icon: ThumbsUp },
  neutral: { label: "Neutral", cls: "bg-gray-100 text-gray-700", icon: Minus },
  avoid: { label: "Avoid", cls: "bg-red-100 text-red-800", icon: ThumbsDown },
};

export function IpoReviewsCard({ reviews }: { reviews: IpoReview[] }) {
  if (reviews.length === 0) return null;

  // Tally
  const subscribeCount = reviews.filter((r) => r.recommendation.startsWith("subscribe")).length;
  const avoidCount = reviews.filter((r) => r.recommendation === "avoid").length;
  const neutralCount = reviews.filter((r) => r.recommendation === "neutral").length;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" /> Broker recommendations
        </h2>
        <span className="text-xs text-gray-500">{reviews.length} houses</span>
      </div>

      {/* Consensus bar */}
      <div className="mb-4">
        <div className="flex h-6 rounded-md overflow-hidden text-[10px] font-semibold text-white">
          {subscribeCount > 0 ? (
            <div className="bg-green-600 flex items-center justify-center px-2" style={{ width: `${(subscribeCount / reviews.length) * 100}%` }}>
              {subscribeCount} Subscribe
            </div>
          ) : null}
          {neutralCount > 0 ? (
            <div className="bg-gray-400 flex items-center justify-center px-2" style={{ width: `${(neutralCount / reviews.length) * 100}%` }}>
              {neutralCount} Neutral
            </div>
          ) : null}
          {avoidCount > 0 ? (
            <div className="bg-red-600 flex items-center justify-center px-2" style={{ width: `${(avoidCount / reviews.length) * 100}%` }}>
              {avoidCount} Avoid
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {reviews.map((r) => {
          const meta = recoMeta[r.recommendation] ?? recoMeta.neutral;
          const Icon = meta.icon;
          return (
            <div key={r.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.brokerHouse}</span>
                  <span className={`badge inline-flex items-center gap-0.5 ${meta.cls}`}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </span>
                </div>
                {r.targetPrice ? (
                  <span className="text-xs text-gray-500">Target: {formatCurrency(Number(r.targetPrice))}</span>
                ) : null}
              </div>
              {r.rationale ? <p className="text-xs text-gray-600 leading-relaxed">{r.rationale}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
