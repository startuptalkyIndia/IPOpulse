import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins } from "lucide-react";
import { unlistedShares, getUnlistedBySlug } from "@/lib/unlisted-shares";

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
  return {
    title: `${u.name} unlisted share price — pre-IPO, grey market`,
    description: `${u.name} unlisted share at ₹${u.recentPrice} as of ${u.asOf}. Sector: ${u.sector}. ${u.description}`,
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/unlisted-shares" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All unlisted shares
      </Link>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Coins className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{u.name}</h1>
            <div className="text-xs text-gray-500 mt-1">{u.sector} · Face Value ₹{u.faceValue}{u.parentCompany ? ` · Parent: ${u.parentCompany}` : ""}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-700 tabular-nums">₹{u.recentPrice}</div>
            <div className="text-[11px] text-gray-400">as of {u.asOf}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`badge ${s.cls}`}>{s.label}</span>
          {u.expectedIpoYear ? <span className="badge bg-indigo-50 text-indigo-700">Expected listing: {u.expectedIpoYear}</span> : null}
          <span className="badge bg-gray-100 text-gray-700 capitalize">Liquidity: {u.liquidity}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{u.description}</p>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3">How to buy unlisted shares</h2>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">1</span>
            <div>Open an account with an unlisted shares dealer (UnlistedZone, InCred, Stockify, etc.). KYC required.</div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">2</span>
            <div>Get quotes from multiple dealers — prices vary 5-15% between them, especially for thinly-traded names.</div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">3</span>
            <div>Pay the dealer; shares are credited to your existing demat account in T+5 to T+10 days.</div>
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
