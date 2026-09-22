"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export interface StockSummary {
  slug: string;
  name: string;
  nseSymbol: string | null;
  sector: string | null;
  industry: string | null;
  price: number | null;
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  roePercent: number | null;
  rocePercent: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  eps: number | null;
  bookValue: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  ret1y: number | null;
  revCagr: number | null;
}

interface SearchHit {
  type: string;
  title: string;
  subtitle?: string;
  href: string;
}

interface Props {
  initial: { a: StockSummary | null; b: StockSummary | null; c: StockSummary | null };
}

function fmtNum(v: number | null, decimals = 1): string {
  return v == null ? "—" : v.toFixed(decimals);
}
function fmtPct(v: number | null, decimals = 1): string {
  return v == null ? "—" : `${v.toFixed(decimals)}%`;
}
function fmtCr(v: number | null): string {
  return v == null ? "—" : formatCurrency(v * 10000000);
}

function StockPicker({
  label,
  current,
  onPick,
}: {
  label: string;
  current: StockSummary | null;
  onPick: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setHits((data.hits ?? []).filter((h: SearchHit) => h.type === "stock"));
      } catch {
        setHits([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="card relative" ref={boxRef}>
      <label className="label">{label}</label>
      {current ? (
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-gray-900">{current.name}</div>
            <div className="text-xs text-gray-500">{current.nseSymbol ?? "—"}</div>
          </div>
          <button
            type="button"
            className="text-xs text-indigo-600 hover:text-indigo-800 shrink-0"
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <input
          className="input w-full"
          placeholder="Search company or symbol…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      )}
      {open && hits.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
          {hits.map((h) => {
            const slug = h.href.replace("/ticker/", "");
            return (
              <button
                key={slug}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                onClick={() => {
                  onPick(slug);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <div className="text-sm text-gray-900">{h.title}</div>
                <div className="text-xs text-gray-500">{h.subtitle}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CompareStocksClient({ initial }: Props) {
  const router = useRouter();
  const { a, b, c } = initial;

  function updateParam(key: "a" | "b" | "c", slug: string) {
    const params = { a: a?.slug, b: b?.slug, c: c?.slug, [key]: slug };
    const qs = (["a", "b", "c"] as const)
      .map((k) => (params[k] ? `${k}=${params[k]}` : null))
      .filter(Boolean)
      .join("&");
    router.push(`/ticker/compare?${qs}`);
  }

  const companies = [a, b, c].filter((x): x is StockSummary => x != null);

  const rows: { label: string; get: (s: StockSummary) => string }[] = [
    { label: "Sector", get: (s) => s.sector ?? "—" },
    { label: "Industry", get: (s) => s.industry ?? "—" },
    { label: "Current price", get: (s) => (s.price != null ? `₹${s.price.toFixed(2)}` : "—") },
    { label: "Market cap", get: (s) => fmtCr(s.marketCap) },
    { label: "P/E ratio", get: (s) => fmtNum(s.peRatio) },
    { label: "P/B ratio", get: (s) => fmtNum(s.pbRatio) },
    { label: "ROE", get: (s) => fmtPct(s.roePercent) },
    { label: "ROCE", get: (s) => fmtPct(s.rocePercent) },
    { label: "Debt / Equity", get: (s) => fmtNum(s.debtToEquity, 2) },
    { label: "Dividend yield", get: (s) => fmtPct(s.dividendYield, 2) },
    { label: "EPS", get: (s) => (s.eps != null ? `₹${s.eps.toFixed(2)}` : "—") },
    { label: "Book value", get: (s) => (s.bookValue != null ? `₹${s.bookValue.toFixed(2)}` : "—") },
    { label: "Operating margin", get: (s) => fmtPct(s.operatingMargin, 1) },
    { label: "Net margin", get: (s) => fmtPct(s.netMargin, 1) },
    { label: "1-year return", get: (s) => fmtPct(s.ret1y, 1) },
    { label: "Revenue CAGR", get: (s) => fmtPct(s.revCagr, 1) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StockPicker label="Stock A" current={a} onPick={(slug) => updateParam("a", slug)} />
        <StockPicker label="Stock B" current={b} onPick={(slug) => updateParam("b", slug)} />
        <StockPicker label="Stock C (optional)" current={c} onPick={(slug) => updateParam("c", slug)} />
      </div>

      {companies.length >= 2 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase text-left whitespace-nowrap">
                  Metric
                </th>
                {companies.map((s) => (
                  <th key={s.slug} className="px-3 py-3 text-sm font-semibold text-gray-900 text-left whitespace-nowrap">
                    <Link href={`/ticker/${s.slug}`} className="hover:text-indigo-600">
                      {s.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-gray-100">
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{r.label}</td>
                  {companies.map((s) => (
                    <td key={s.slug} className="px-3 py-2.5 text-sm text-gray-900 tabular-nums whitespace-nowrap">
                      {r.get(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-sm text-gray-500">Pick at least two stocks above to compare side-by-side.</p>
        </div>
      )}
    </div>
  );
}
