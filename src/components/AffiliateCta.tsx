import { ExternalLink, Zap } from "lucide-react";
import { getAffiliate, type Affiliate } from "@/lib/affiliates";

type Variant = "primary" | "secondary" | "minimal";

interface Props {
  slug: string;
  variant?: Variant;
  label?: string;
  className?: string;
}

export function AffiliateCta({ slug, variant = "primary", label, className = "" }: Props) {
  const a = getAffiliate(slug);
  if (!a) return null;
  const text = label ?? a.ctaLong;

  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition";
  const cls =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : variant === "secondary"
      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
      : "text-indigo-600 hover:text-indigo-800 underline";

  return (
    <a
      href={a.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`${base} ${cls} ${className}`}
      data-affiliate={a.slug}
      data-affiliate-cat={a.category}
    >
      {variant !== "minimal" && a.category === "demat" ? <Zap className="w-3.5 h-3.5" /> : null}
      {text}
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  );
}

export function ApplyIpoCtaRow({ ipoName }: { ipoName?: string }) {
  // Show top 3 demat partners side by side; user picks which to open Demat with
  const brokers: Affiliate[] = ["angel-one", "groww", "upstox"]
    .map((s) => getAffiliate(s))
    .filter((a): a is Affiliate => a !== null);

  return (
    <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Don&apos;t have a Demat? Open one in 5 mins to apply{ipoName ? ` ${ipoName}` : " IPOs"}
        </h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Free account opening. UPI-based IPO apply takes seconds. Pick a broker and open below.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {brokers.map((b) => (
          <a
            key={b.slug}
            href={b.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            data-affiliate={b.slug}
            className="text-xs font-medium bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-lg text-center transition"
          >
            Open {b.name}
          </a>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        IPOpulse may earn a referral commission at no extra cost to you. Read our{" "}
        <a href="/terms" className="underline">terms</a>.
      </p>
    </div>
  );
}

export function CreditCardCtaRow() {
  const cards: Affiliate[] = ["hdfc-millennia", "amazon-pay-icici", "sbi-cashback"]
    .map((s) => getAffiliate(s))
    .filter((a): a is Affiliate => a !== null);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Compare top credit cards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {cards.map((c) => (
          <a
            key={c.slug}
            href={c.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            data-affiliate={c.slug}
            className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-3 py-2 rounded-lg text-center transition"
          >
            Apply {c.name}
          </a>
        ))}
      </div>
    </div>
  );
}
