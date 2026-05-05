import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { EnrichedPeer } from "@/lib/drhp-peer-enrichment";

/**
 * Side-by-side valuation table. Peers extracted from the prospectus are
 * resolved to our `companies` table; matched rows show real fundamentals
 * (P/E, P/B, ROE, D/E, market cap, LTP). Unmatched rows still render the
 * peer name and rationale — value isn't lost just because we don't have
 * the company in our DB yet.
 */

interface Props {
  peers: EnrichedPeer[];
  /** Header label — defaults to "Listed peers (analyst pick)" */
  title?: string;
  /** Show source page links if extracted */
  showPageRef?: boolean;
}

function num(v: number | null, suffix = "", decimals = 1): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v.toFixed(decimals)}${suffix}`;
}

export function EnrichedPeerTable({ peers, title = "Listed peers — side by side", showPageRef = true }: Props) {
  if (!peers || peers.length === 0) return null;

  const matched = peers.filter((p) => p.companySlug != null);
  const unmatched = peers.filter((p) => p.companySlug == null);

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-teal-600" /> {title}
        </h3>
        <span className="text-[11px] text-gray-500">
          {matched.length} of {peers.length} matched to our DB
        </span>
      </div>

      {matched.length > 0 ? (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-2 py-1.5 font-medium">Peer</th>
                <th className="px-2 py-1.5 font-medium text-right">M-cap</th>
                <th className="px-2 py-1.5 font-medium text-right">LTP</th>
                <th className="px-2 py-1.5 font-medium text-right">P/E</th>
                <th className="px-2 py-1.5 font-medium text-right">P/B</th>
                <th className="px-2 py-1.5 font-medium text-right">ROE %</th>
                <th className="px-2 py-1.5 font-medium text-right">D/E</th>
                <th className="px-2 py-1.5 font-medium text-right">Div %</th>
                {showPageRef ? <th className="px-2 py-1.5 font-medium text-right">Source</th> : null}
              </tr>
            </thead>
            <tbody>
              {matched.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1.5">
                    <Link
                      href={`/ticker/${p.companySlug}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 inline-flex items-center gap-1"
                    >
                      {p.name} <ExternalLink className="w-3 h-3 opacity-50" />
                    </Link>
                    <div className="text-[10px] text-gray-500 mt-0.5">{p.rationale}</div>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-900">
                    {p.marketCapCr ? formatCurrency(p.marketCapCr * 10000000) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">
                    {p.ltp != null ? `₹${p.ltp.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">{num(p.peRatio)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">{num(p.pbRatio)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">{num(p.roePercent)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">{num(p.debtToEquity, "", 2)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-700">{num(p.dividendYield)}</td>
                  {showPageRef ? (
                    <td className="px-2 py-1.5 text-right text-[11px] text-gray-400 tabular-nums">
                      {p.pageRef ?? "—"}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {unmatched.length > 0 ? (
        <div className={matched.length > 0 ? "mt-4 pt-3 border-t border-gray-100" : ""}>
          <div className="text-[11px] text-gray-500 mb-1.5">
            Mentioned but not yet in our DB:
          </div>
          <ul className="space-y-1">
            {unmatched.map((p, i) => (
              <li key={i} className="text-xs text-gray-700">
                <span className="font-medium text-gray-900">{p.name}</span>
                <span className="text-gray-500"> — {p.rationale}</span>
                {showPageRef && p.pageRef ? (
                  <span className="text-[11px] text-gray-400 ml-2">{p.pageRef}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
