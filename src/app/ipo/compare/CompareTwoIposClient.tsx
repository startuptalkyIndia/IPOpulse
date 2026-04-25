"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

interface IpoSummary {
  slug: string;
  name: string;
  type: string;
  status: string;
  priceBandLow: number | null;
  priceBandHigh: number | null;
  lotSize: number | null;
  issueSize: number | null;
  openDate: string | null;
  closeDate: string | null;
  listingDate: string | null;
  allotmentDate: string | null;
  registrar: string | null;
  latestSubTotalX: number | null;
  latestSubQibX: number | null;
  latestSubRetailX: number | null;
  latestGmp: number | null;
  anchorCount: number;
  anchorValueCr: number;
  listingPrice: number | null;
  listingGainPct: number | null;
}

interface IpoListItem {
  slug: string;
  name: string;
  type: string;
  status: string;
}

interface Props {
  allIpos: IpoListItem[];
  initial: { a: IpoSummary | null; b: IpoSummary | null };
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s));
}

export function CompareTwoIposClient({ allIpos, initial }: Props) {
  const router = useRouter();
  const [a, b] = [initial.a, initial.b];

  function changeA(slug: string) {
    router.push(`/ipo/compare?a=${slug}${b ? `&b=${b.slug}` : ""}`);
  }
  function changeB(slug: string) {
    router.push(`/ipo/compare?${a ? `a=${a.slug}&` : ""}b=${slug}`);
  }

  const rows: { label: string; av: string; bv: string }[] = [];

  if (a && b) {
    rows.push(
      { label: "Type", av: a.type === "sme" ? "SME" : "Mainboard", bv: b.type === "sme" ? "SME" : "Mainboard" },
      { label: "Status", av: a.status, bv: b.status },
      {
        label: "Price band",
        av: a.priceBandLow && a.priceBandHigh ? `₹${a.priceBandLow}–${a.priceBandHigh}` : "—",
        bv: b.priceBandLow && b.priceBandHigh ? `₹${b.priceBandLow}–${b.priceBandHigh}` : "—",
      },
      { label: "Lot size", av: a.lotSize ? `${a.lotSize} shares` : "—", bv: b.lotSize ? `${b.lotSize} shares` : "—" },
      {
        label: "Issue size",
        av: a.issueSize ? `₹${a.issueSize.toFixed(0)} Cr` : "—",
        bv: b.issueSize ? `₹${b.issueSize.toFixed(0)} Cr` : "—",
      },
      { label: "Open date", av: fmtDate(a.openDate), bv: fmtDate(b.openDate) },
      { label: "Close date", av: fmtDate(a.closeDate), bv: fmtDate(b.closeDate) },
      { label: "Allotment date", av: fmtDate(a.allotmentDate), bv: fmtDate(b.allotmentDate) },
      { label: "Listing date", av: fmtDate(a.listingDate), bv: fmtDate(b.listingDate) },
      { label: "Registrar", av: a.registrar ?? "—", bv: b.registrar ?? "—" },
      {
        label: "Total subscription",
        av: a.latestSubTotalX != null ? `${a.latestSubTotalX.toFixed(2)}×` : "—",
        bv: b.latestSubTotalX != null ? `${b.latestSubTotalX.toFixed(2)}×` : "—",
      },
      {
        label: "QIB subscription",
        av: a.latestSubQibX != null ? `${a.latestSubQibX.toFixed(2)}×` : "—",
        bv: b.latestSubQibX != null ? `${b.latestSubQibX.toFixed(2)}×` : "—",
      },
      {
        label: "Retail subscription",
        av: a.latestSubRetailX != null ? `${a.latestSubRetailX.toFixed(2)}×` : "—",
        bv: b.latestSubRetailX != null ? `${b.latestSubRetailX.toFixed(2)}×` : "—",
      },
      { label: "Latest GMP", av: a.latestGmp != null ? `₹${a.latestGmp}` : "—", bv: b.latestGmp != null ? `₹${b.latestGmp}` : "—" },
      { label: "Anchor investors", av: `${a.anchorCount}`, bv: `${b.anchorCount}` },
      {
        label: "Anchor value",
        av: a.anchorValueCr ? formatCurrency(a.anchorValueCr * 10000000) : "—",
        bv: b.anchorValueCr ? formatCurrency(b.anchorValueCr * 10000000) : "—",
      },
      {
        label: "Listing price",
        av: a.listingPrice != null ? `₹${a.listingPrice}` : "—",
        bv: b.listingPrice != null ? `₹${b.listingPrice}` : "—",
      },
      {
        label: "Listing gain",
        av: a.listingGainPct != null ? `${a.listingGainPct >= 0 ? "+" : ""}${a.listingGainPct.toFixed(2)}%` : "—",
        bv: b.listingGainPct != null ? `${b.listingGainPct >= 0 ? "+" : ""}${b.listingGainPct.toFixed(2)}%` : "—",
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <label className="label">IPO A</label>
          <select className="input w-full" value={a?.slug ?? ""} onChange={(e) => changeA(e.target.value)}>
            <option value="">— pick an IPO —</option>
            {allIpos.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.name} ({i.type === "sme" ? "SME" : "MB"})
              </option>
            ))}
          </select>
        </div>
        <div className="card">
          <label className="label">IPO B</label>
          <select className="input w-full" value={b?.slug ?? ""} onChange={(e) => changeB(e.target.value)}>
            <option value="">— pick an IPO —</option>
            {allIpos.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.name} ({i.type === "sme" ? "SME" : "MB"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {a && b ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase text-left">Metric</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-900 text-left">
                  <Link href={`/ipo/${a.slug}`} className="hover:text-indigo-600">
                    {a.name}
                  </Link>
                </th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-900 text-left">
                  <Link href={`/ipo/${b.slug}`} className="hover:text-indigo-600">
                    {b.name}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-gray-100">
                  <td className="px-3 py-2.5 text-xs text-gray-500">{r.label}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-900 tabular-nums">{r.av}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-900 tabular-nums">{r.bv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-sm text-gray-500">Pick two IPOs above to compare side-by-side.</p>
        </div>
      )}
    </div>
  );
}
