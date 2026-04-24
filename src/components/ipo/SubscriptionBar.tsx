import { formatPlain } from "@/lib/format";

interface Props {
  label: string;
  value: number | null;
  max?: number;
}

export function SubscriptionBar({ label, value, max = 50 }: Props) {
  const v = value ?? 0;
  const pct = Math.min((v / max) * 100, 100);
  const color = v >= 1 ? "bg-green-500" : v >= 0.5 ? "bg-indigo-500" : "bg-gray-300";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900 tabular-nums">{formatPlain(v)}x</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
