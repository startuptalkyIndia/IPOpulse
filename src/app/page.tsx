export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Calculator,
  Activity,
  ArrowRight,
  LineChart,
  Newspaper,
  Rocket,
  PiggyBank,
  GraduationCap,
  Compass,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { SITE_MAP } from "@/lib/site-map";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { WhatsAppBanner } from "@/components/WhatsAppBanner";


async function fetchLatestNews(): Promise<Array<{ title: string; link: string; source: string; pubDate: string }>> {
  try {
    const url = `https://news.google.com/rss/search?q=India+stock+market+NSE+Nifty+IPO&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 900 }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: Array<{ title: string; link: string; source: string; pubDate: string }> = [];
    const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const m of matches) {
      const c = m[1];
      const title = c.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? c.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const link = c.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const source = c.match(/<source[^>]*>(.*?)<\/source>/)?.[1] ?? "Google News";
      const pubDate = c.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      if (title && link) items.push({ title, link, source, pubDate });
      if (items.length >= 8) break;
    }
    return items;
  } catch { return []; }
}

// Icon + color maps for homepage category sections (from SITE_MAP)
const HOME_ICONS: Record<string, React.ElementType> = {
  Rocket, LineChart, Activity, PiggyBank, Calculator, Newspaper, GraduationCap,
};
const HOME_COLORS: Record<string, string> = {
  ipo: "text-rose-600 bg-rose-50",
  stocks: "text-indigo-600 bg-indigo-50",
  markets: "text-violet-600 bg-violet-50",
  funds: "text-emerald-600 bg-emerald-50",
  tools: "text-amber-600 bg-amber-50",
  research: "text-blue-600 bg-blue-50",
  learn: "text-teal-600 bg-teal-50",
};

const calcShortcuts = [
  { href: "/calculators/sip", label: "SIP Calculator", color: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" },
  { href: "/calculators/emi", label: "EMI Calculator", color: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" },
  { href: "/calculators/tax", label: "Income Tax", color: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" },
  { href: "/calculators/lumpsum", label: "Lumpsum", color: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200" },
  { href: "/calculators/fd", label: "FD Calculator", color: "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200" },
  { href: "/calculators/brokerage",      label: "Brokerage",     color: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200" },
  { href: "/calculators/stock-forecast", label: "FORE Forecast",  color: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200" },
  { href: "/calculators/capital-gains",  label: "Capital Gains",  color: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200" },
];

const whyStats = [
  { stat: "2,500+", label: "Companies tracked", color: "text-indigo-600", bg: "bg-indigo-50" },
  { stat: "65+", label: "Free guides & articles", color: "text-emerald-600", bg: "bg-emerald-50" },
  { stat: "15-min", label: "Price update frequency", color: "text-sky-600", bg: "bg-sky-50" },
  { stat: "25+", label: "Free calculators", color: "text-violet-600", bg: "bg-violet-50" },
];

export default async function HomePage() {
  const [liveCount, upcomingCount, todayFiiDii, nifty50, latestNews] = await Promise.all([
    prisma.ipo.count({ where: { status: "live" } }).catch(() => 0),
    prisma.ipo.count({ where: { status: "upcoming" } }).catch(() => 0),
    prisma.fiiDiiDaily.findFirst({ where: { segment: "cash" }, orderBy: { date: "desc" } }).catch(() => null),
    prisma.niftyIndex.findFirst({ where: { indexName: "Nifty 50" }, orderBy: { date: "desc" } }).catch(() => null),
    fetchLatestNews(),
  ]);
  const fiiNet = todayFiiDii?.fiiNet ? Number(todayFiiDii.fiiNet) : null;
  const diiNet = todayFiiDii?.diiNet ? Number(todayFiiDii.diiNet) : null;

  // Sector performance from today's bhavcopy
  const sectorPerf = await (async () => {
    try {
      const latest = await prisma.bhavcopyDaily.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
      const prev = await prisma.bhavcopyDaily.findFirst({ where: { date: { lt: latest!.date } }, orderBy: { date: "desc" }, select: { date: true } });
      if (!latest || !prev) return [];
      const [todayRows, prevRows] = await Promise.all([
        prisma.bhavcopyDaily.findMany({ where: { date: latest.date }, select: { companyId: true, close: true, company: { select: { sector: true } } } }),
        prisma.bhavcopyDaily.findMany({ where: { date: prev.date }, select: { companyId: true, close: true } }),
      ]);
      const prevMap = new Map(prevRows.map(r => [r.companyId, Number(r.close)]));
      const sectorMap = new Map<string, number[]>();
      for (const r of todayRows) {
        const sec = r.company.sector;
        if (!sec) continue;
        const p = prevMap.get(r.companyId);
        if (!p) continue;
        const pct = ((Number(r.close) - p) / p) * 100;
        if (!Number.isFinite(pct)) continue;
        const arr = sectorMap.get(sec) ?? [];
        arr.push(pct);
        sectorMap.set(sec, arr);
      }
      return Array.from(sectorMap.entries())
        .map(([sector, pcts]) => ({ sector, avg: pcts.reduce((a, b) => a + b, 0) / pcts.length }))
        .filter(s => s.avg !== 0)
        .sort((a, b) => b.avg - a.avg);
    } catch { return []; }
  })();

  return (
    <div>
      {/* Hero — dark gradient */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 mb-4">
              🇮🇳 India&apos;s structured market data hub
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Every IPO, every stock,{" "}
              <span className="text-indigo-300">every number</span>
              {" "}— in one clean dashboard.
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl">
              Live GMP with history. Allotment in one click. 10-year financials. Sector-wise FII flows.
              Super-investor portfolios. 20+ free calculators. Built mobile-first, ad-light, and structured
              — so you find what you need in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/ipo"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
              >
                Explore IPOs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/screener"
                className="inline-flex items-center gap-1 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Stock Screener
              </Link>
              <Link
                href="/calculators"
                className="inline-flex items-center gap-1 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Calculators
              </Link>
            </div>

            {/* Live stats strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 max-w-3xl">
              {/* Nifty 50 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5 col-span-1">
                <div className="text-[11px] text-slate-400 mb-0.5">Nifty 50</div>
                <div className="text-base font-bold text-white tabular-nums">
                  {nifty50 ? Number(nifty50.close).toLocaleString("en-IN") : "—"}
                </div>
                {nifty50?.changePct != null && (
                  <div className={`text-[11px] tabular-nums font-medium ${Number(nifty50.changePct) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(nifty50.changePct) >= 0 ? "▲" : "▼"} {Math.abs(Number(nifty50.changePct)).toFixed(2)}%
                  </div>
                )}
              </div>
              {/* Nifty P/E */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">Nifty P/E</div>
                <div className="text-base font-bold text-indigo-300 tabular-nums">
                  {nifty50?.pe ? Number(nifty50.pe).toFixed(1) : "—"}
                </div>
                {nifty50?.divYield && <div className="text-[11px] text-slate-400">div {Number(nifty50.divYield).toFixed(2)}%</div>}
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">Open IPOs</div>
                <div className="text-base font-bold text-emerald-400 tabular-nums">{liveCount}</div>
                <div className="text-[11px] text-slate-400">{upcomingCount} upcoming</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">FII net</div>
                <div className={`text-base font-bold tabular-nums ${fiiNet == null ? "text-slate-500" : fiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {fiiNet == null ? "—" : formatCurrency(fiiNet)}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2.5">
                <div className="text-[11px] text-slate-400 mb-0.5">DII net</div>
                <div className={`text-base font-bold tabular-nums ${diiNet == null ? "text-slate-500" : diiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {diiNet == null ? "—" : formatCurrency(diiNet)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Channel CTA */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <WhatsAppBanner />
      </div>

      {/* Sector performance strip */}
      {sectorPerf.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Today&apos;s sectors</h2>
            <Link href="/sectors/momentum" className="text-xs text-indigo-600 hover:text-indigo-800 ml-auto">
              Full breakdown →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {sectorPerf.map(({ sector, avg }) => (
              <Link
                key={sector}
                href={`/sectors/${sector.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                  avg >= 1 ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                  avg >= 0 ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" :
                  avg >= -1 ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                  "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                }`}
              >
                {sector}
                <span className="tabular-nums">{avg >= 0 ? "+" : ""}{avg.toFixed(1)}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorized sections — driven by canonical site map */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Everything in one place</h2>
            <p className="text-sm text-gray-500 mt-0.5">Organized by what you want to do — IPOs, stocks, markets, funds, tools and more.</p>
          </div>
          <Link href="/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap">
            <Compass className="w-4 h-4" /> Explore all →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {SITE_MAP.map((section) => {
            const SecIcon = HOME_ICONS[section.icon] ?? Compass;
            const color = HOME_COLORS[section.key] ?? "text-indigo-600 bg-indigo-50";
            const links = section.groups.flatMap((g) => g.links).slice(0, 6);
            return (
              <div key={section.key} className="card p-5 hover:shadow-md transition-shadow duration-200">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                    <SecIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {section.href ? <Link href={section.href} className="hover:text-indigo-700">{section.label}</Link> : section.label}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{section.blurb}</p>
                  </div>
                  {section.href && (
                    <Link href={section.href} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap flex items-center gap-0.5">
                      All <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                {/* Links as clean rows */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center gap-1.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">{link.label}</span>
                      {link.badge && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">{link.badge}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calculator shortcuts */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Calculator className="w-3.5 h-3.5" />
              </span>
              Popular Calculators
            </h2>
            <Link href="/calculators" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {calcShortcuts.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`text-center text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 transition-all duration-150 hover:shadow-sm ${c.color}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Market News */}
      {latestNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Newspaper className="w-3.5 h-3.5" />
                </span>
                Latest Market News
              </h2>
              <Link href="/news" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                All news →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {latestNews.slice(0, 6).map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 py-2.5 px-0 sm:px-3 first:pl-0 last:pr-0 hover:text-indigo-700 transition-colors group">
                  <span className="text-gray-300 text-sm font-bold mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-xs text-gray-800 font-medium leading-snug line-clamp-2 group-hover:text-indigo-700">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.source}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <NewsletterSignup variant="card" />
      </section>

      {/* Why IPOpulse — colourful stats */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-14">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 md:px-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-40" />
          <div className="relative">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-4">Why IPOpulse?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {whyStats.map((item) => (
                <div key={item.stat} className="text-center">
                  <div className="text-3xl font-bold text-white">{item.stat}</div>
                  <div className="text-white/70 text-xs mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
