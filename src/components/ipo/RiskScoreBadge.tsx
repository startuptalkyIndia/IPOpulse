/**
 * Compact risk score badge for IPO list views.
 *
 * Server-renderable. Pure props in, indigo-themed, tabular numerals.
 * Designed to slot into any tile/row alongside an IPO name.
 */

import { Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from "lucide-react";

type Band = "clean" | "watch" | "caution" | "high-risk";

interface Props {
  score: number;
  band: Band | string | null;
  size?: "sm" | "md";
  /** When true, shows "Risk N/100" prefix; when false, just the score + band icon */
  showLabel?: boolean;
}

const BAND_STYLE: Record<Band, { color: string; bg: string; ring: string; label: string; Icon: typeof ShieldCheck }> = {
  "clean":      { color: "text-green-700",  bg: "bg-green-50",  ring: "ring-green-200",  label: "Clean",     Icon: ShieldCheck  },
  "watch":      { color: "text-yellow-700", bg: "bg-yellow-50", ring: "ring-yellow-200", label: "Watch",     Icon: ShieldAlert  },
  "caution":    { color: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-200", label: "Caution",   Icon: AlertTriangle},
  "high-risk":  { color: "text-red-700",    bg: "bg-red-50",    ring: "ring-red-200",    label: "High risk", Icon: AlertOctagon },
};

export function RiskScoreBadge({ score, band, size = "sm", showLabel = false }: Props) {
  const safeBand: Band = (band as Band) in BAND_STYLE ? (band as Band) : "watch";
  const s = BAND_STYLE[safeBand];
  const I = s.Icon;
  const dim = size === "md" ? "text-sm px-2.5 py-1" : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ring-1 ${s.bg} ${s.color} ${s.ring} ${dim} font-semibold tabular-nums`}
      title={`DRHP risk score (lower = lower flagged risk per the prospectus extract)`}
    >
      <I className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {showLabel ? <Sparkles className="w-2.5 h-2.5 opacity-70" /> : null}
      {showLabel ? <span className="opacity-80 font-normal">Risk</span> : null}
      <span>{score}/100</span>
      <span className="opacity-70 font-normal">· {s.label}</span>
    </span>
  );
}

export function bandFromScore(score: number): Band {
  if (score <= 25) return "clean";
  if (score <= 50) return "watch";
  if (score <= 75) return "caution";
  return "high-risk";
}
