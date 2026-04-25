import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins, Activity } from "lucide-react";
import { unlistedShares, getUnlistedBySlug, computeIndex } from "@/lib/unlisted-shares";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return unlistedShares.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnlistedBySlug(slug);
  if (!u) return { title: "Unlisted share not found" };
  const idx = computeIndex(u.quotes);
  return {
    title: `${u.name} unlisted share price — multi-dealer median`,
    description: `${u.name} unlisted share at ₹${idx?.median.toFixed(0) ?? "?"} (median across ${u.quotes.length} dealers). Range ₹${idx?.rangeLow ?? "?"}–₹${idx?.rangeHigh ?? "?"}. ${u.description}`,
    alternates: { canonical: `/unlisted-shares/${u.slug}` },
  };
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  drhp_filed: { label: "DRHP Filed with SEBI", cls: "bg-green-100 text-green-800" },
  rumored: { label: "IPO Rumored", cls: "bg-yellow-100 text-yellow-800" },
  private: { label: "Currently Private", cls: "bg-gray-100 text-gray-700" },
  demerger: { label: "Demerger / Spin-off Expected", cls: "bg-purple-100 text-purple-800" },
};

export default async function UnlistedDetail({ params }: Props) {
  const { slug } = await params;
  const u = getUnlistedBySlug(slug);
  if (!u) notFound();

  const s = statusLabel[u.ipoStatus];
  const idx = computeIndex(u.quotes);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/unlisted-shares" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All unlisted shares
      </Link>

      <div className="card">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Coins className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{u.name}</h1>
            <div className="text-xs text-gray-500 mt-1">
              {u.sector} · Face Value ₹{u.faceValue}{u.parentCompany ? ` · Parent: ${u.parentCompany}` : ""}
            </div>
          </div>
          {idx ? (
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-700 tabular-nums">₹{idx.median.toFixed(0)}</div>
              <div className="text-[11px] text-gray-400">median · {u.quotes.length} dealers · {idx.asOf}</div>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`badge ${s.cls}`}>{s.label}</span>
          {u.expectedIpoYear ? <span className="badge bg-indigo-50 text-indigo-700">Expected listing: {u.expectedIpoYear}</span> : null}
          <span className="badge bg-gray-100 text-gray-700 capitalize">Liquidity: {u.liquidity}</span>
        </div>
      </div>

      {idx ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Price Index — multi-dealer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Median bid</div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">₹{idx.bidMedian.toFixed(0)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Median ask</div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">₹{idx.askMedian.toFixed(0)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Spread</div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">{idx.spreadPct.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Dealer range</div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums mt-0.5">{idx.rangePct.toFixed(1)}%</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Dealer-by-dealer quotes</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2 pr-3">Dealer</th>
                <th className="py-2 pr-3 text-right">Bid</th>
                <th className="py-2 pr-3 text-right">Ask</th>
                <th className="py-2 text-right">Mid</th>
              </tr>
            </thead>
            <tbody>
              {u.quotes.map((q) => {
                const mid = (q.bid + q.ask) / 2;
                return (
                  <tr key={q.dealer} className="border-b border-gray-100">
                    <td className="py-2 pr-3 text-sm font-medium text-gray-900">{q.dealer}</td>
                    <td className="py-2 pr-3 text-sm text-gray-700 text-right tabular-nums">₹{q.bid}</td>
                    <td className="py-2 pr-3 text-sm text-gray-700 text-right tabular-nums">₹{q.ask}</td>
                    <td className="py-2 text-sm text-indigo-700 text-right tabular-nums font-semibold">₹{mid}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-400 mt-3">
            We aggregate quotes from major Indian unlisted-shares dealers and publish the median. The spread between
            bid and ask reflects dealer margin; the dealer-range tells you how far quotes vary across the market.
          </p>
        </div>
      ) : null}

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{u.description}</p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">How to buy unlisted shares</h2>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">1</span>
            <div>Open an account with an unlisted shares dealer. KYC required.</div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">2</span>
            <div>Compare the median above against the dealer&apos;s quote. If they&apos;re quoting more than 5% above median, push back or look elsewhere.</div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">3</span>
            <div>Pay the dealer; shares are credited to your existing demat in T+5 to T+10 days.</div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">4</span>
            <div>Lock-in: most unlisted shares have a 6-month lock-in post-IPO listing (SEBI rule). Plan accordingly.</div>
          </li>
        </ol>
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-semibold">Risks:</span> Unlisted shares are illiquid. The IPO may be delayed, downsized, or
          cancelled. Listing price often disappoints relative to grey-market expectations (see our <Link className="underline" href="/ipo/gmp-accuracy">GMP Accuracy Scorecard</Link>).
          Capital gains tax applies on listing. Settlement is dealer-dependent — there&apos;s no regulator if a dealer defaults.
        </p>
      </div>
    </div>
  );
}
