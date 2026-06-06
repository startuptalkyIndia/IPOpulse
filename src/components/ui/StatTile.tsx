import type { ReactNode } from "react";

/**
 * Groww-style stat tile — a soft rounded tile with a muted label and a big
 * bold value. Optional sub-line and accent color. Used across the site for
 * consistent metric display.
 */

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Tailwind text-color class for the value (e.g. "text-emerald-600") */
  valueColor?: string;
  /** Optional left icon */
  icon?: ReactNode;
  /** Tint variant for the tile background */
  tint?: "gray" | "indigo" | "emerald" | "red" | "amber" | "violet";
  className?: string;
}

const TINTS: Record<NonNullable<Props["tint"]>, string> = {
  gray: "bg-gray-50/70",
  indigo: "bg-indigo-50/70",
  emerald: "bg-emerald-50/70",
  red: "bg-red-50/70",
  amber: "bg-amber-50/70",
  violet: "bg-violet-50/70",
};

export function StatTile({ label, value, sub, valueColor = "text-gray-900", icon, tint = "gray", className = "" }: Props) {
  return (
    <div className={`${TINTS[tint]} rounded-2xl px-4 py-3.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 tracking-wide">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-bold tabular-nums mt-1 ${valueColor}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
