import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Groww-style price-change pill — colored green/red with an arrow icon.
 * Renders absolute change and/or percentage. Used wherever a price delta shows.
 */

interface Props {
  /** Percentage change (e.g. 2.34 for +2.34%) */
  pct?: number | null;
  /** Absolute change in ₹ (optional) */
  abs?: number | null;
  size?: "sm" | "md" | "lg";
  /** Show the colored pill background, or just colored text */
  pill?: boolean;
}

export function PriceChange({ pct, abs, size = "md", pill = true }: Props) {
  if (pct == null && abs == null) return <span className="text-gray-400">—</span>;
  const positive = (pct ?? abs ?? 0) >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  const textSize = size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "lg" ? "w-4 h-4" : size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  const colorText = positive ? "text-emerald-700" : "text-red-600";
  const colorBg = positive ? "bg-emerald-50" : "bg-red-50";

  const parts: string[] = [];
  if (abs != null) parts.push(`${positive ? "+" : ""}₹${Math.abs(abs).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
  if (pct != null) parts.push(`${positive ? "+" : ""}${pct.toFixed(2)}%`);

  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${textSize} ${colorText} ${pill ? `${colorBg} px-2 py-0.5 rounded-lg` : ""}`}>
      <Icon className={iconSize} />
      {parts.join(" · ")}
    </span>
  );
}
