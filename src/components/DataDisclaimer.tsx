import { Info, Database } from "lucide-react";

interface Props {
  variant?: "seed" | "illustrative" | "manual" | "live";
  message?: string;
  source?: string;
}

const VARIANTS: Record<NonNullable<Props["variant"]>, { color: string; icon: typeof Info; defaultMessage: string }> = {
  seed: {
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: Database,
    defaultMessage: "Sample data shown — live ingestion is wiring up. Numbers below are representative, not real-time.",
  },
  illustrative: {
    color: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
    defaultMessage: "Illustrative figures only. Use exchange / source for real-time decisions.",
  },
  manual: {
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    icon: Info,
    defaultMessage: "Manually curated. Updated by our editor; verify with the issuer/exchange before transacting.",
  },
  live: {
    color: "bg-green-50 border-green-200 text-green-800",
    icon: Database,
    defaultMessage: "Live data, refreshed automatically.",
  },
};

export function DataDisclaimer({ variant = "seed", message, source }: Props) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <div className={`rounded-lg border px-3 py-2 flex items-start gap-2 text-xs ${v.color}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <div>
        <span>{message ?? v.defaultMessage}</span>
        {source ? <span className="ml-1 opacity-75">Source: {source}.</span> : null}
      </div>
    </div>
  );
}
