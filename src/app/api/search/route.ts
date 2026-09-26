import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculators } from "@/lib/calculators/configs";
import { sectors } from "@/lib/sectors";
import { superInvestors } from "@/lib/super-investors";

export const dynamic = "force-dynamic";

interface Hit {
  type: "ipo" | "stock" | "calculator" | "sector" | "investor" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

const STATIC_PAGES: { title: string; href: string; subtitle: string }[] = [
  { title: "IPO Dashboard", href: "/ipo", subtitle: "Live, upcoming, closed, listed IPOs" },
  { title: "IPO Allotment Status", href: "/ipo/allotment", subtitle: "Check across all registrars" },
  { title: "GMP Accuracy Scorecard", href: "/ipo/gmp-accuracy", subtitle: "How accurate is GMP really?" },
  { title: "DRHP AI Search", href: "/ipo/drhp", subtitle: "Ask anything about IPO prospectuses" },
  { title: "FII / DII Activity", href: "/fii-dii", subtitle: "Daily flows + 30-day chart" },
  { title: "Earnings Calendar", href: "/earnings-calendar", subtitle: "Upcoming results dates" },
  { title: "Dividend Yield Stocks", href: "/dividend-yield", subtitle: "Top dividend payers" },
  { title: "RBI Repo Rate", href: "/repo-rate", subtitle: "Current rate + full MPC decision history" },
  { title: "Compare Stocks", href: "/ticker/compare", subtitle: "P/E, ROE, margins & returns side-by-side" },
  { title: "Compare Brokers", href: "/compare/brokers", subtitle: "Zerodha vs Groww vs Upstox..." },
  { title: "Compare Credit Cards", href: "/compare/credit-cards", subtitle: "Top Indian credit cards" },
  { title: "All Calculators", href: "/calculators", subtitle: "20+ free financial calculators" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  const matches = (s: string) => s.toLowerCase().includes(q);

  const hits: Hit[] = [];

  // Calculators (in-memory)
  for (const c of calculators) {
    if (matches(c.title) || matches(c.shortTitle) || (c.tags ?? []).some((t) => matches(t))) {
      hits.push({ type: "calculator", title: c.title, subtitle: c.description.slice(0, 80), href: `/calculators/${c.slug}` });
    }
  }

  // Sectors
  for (const s of sectors) {
    if (matches(s.name) || (s.niftyIndex && matches(s.niftyIndex))) {
      hits.push({ type: "sector", title: s.name, subtitle: s.niftyIndex ?? "Sector", href: `/sectors/${s.slug}` });
    }
  }

  // Super investors
  for (const i of superInvestors) {
    if (matches(i.name) || matches(i.shortName)) {
      hits.push({ type: "investor", title: i.name, subtitle: "Super Investor portfolio", href: `/super-investor/${i.slug}` });
    }
  }

  // Static pages
  for (const p of STATIC_PAGES) {
    if (matches(p.title) || matches(p.subtitle)) {
      hits.push({ type: "page", title: p.title, subtitle: p.subtitle, href: p.href });
    }
  }

  // DB: IPOs and companies. Matches by name OR ticker symbol — a query like
  // "NSE" is a valid exact ticker for a company/IPO whose NAME doesn't
  // contain those 3 letters as a substring (e.g. "National Stock Exchange
  // of India Limited" has no "nse" substring at all), so symbol-only misses
  // are a real, previously-unfixed gap, not an edge case.
  try {
    const [ipos, companies] = await Promise.all([
      prisma.ipo.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nseSymbol: { contains: q, mode: "insensitive" } },
            { bseCode: { equals: q } },
          ],
        },
        select: { name: true, slug: true, type: true, status: true, nseSymbol: true },
        take: 8,
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nseSymbol: { contains: q, mode: "insensitive" } },
            { bseCode: { equals: q } },
          ],
          active: true,
        },
        select: { name: true, slug: true, sector: true, nseSymbol: true },
        take: 8,
      }),
    ]);

    for (const i of ipos) {
      const kind = i.type === "sme" ? "SME" : "Mainboard";
      hits.push({
        type: "ipo",
        title: i.name,
        subtitle: i.nseSymbol ? `${i.nseSymbol} · ${kind} · ${i.status}` : `${kind} · ${i.status}`,
        href: `/ipo/${i.slug}`,
      });
    }
    for (const c of companies) {
      hits.push({
        type: "stock",
        title: c.name,
        subtitle: `${c.nseSymbol ?? ""} · ${c.sector ?? ""}`.trim(),
        href: `/ticker/${c.slug}`,
      });
    }
  } catch {
    // DB unreachable at build — fine
  }

  // An exact symbol/name match (e.g. searching "NSE" and finding a company
  // whose ticker literally IS "NSE") is always the most relevant result —
  // surface it first rather than leaving it wherever the DB happened to
  // return it, possibly buried behind unrelated substring noise.
  const qUpper = q.toUpperCase();
  hits.sort((a, b) => {
    const aExact = a.title.toUpperCase() === qUpper || a.subtitle?.toUpperCase().startsWith(qUpper + " ") ? 1 : 0;
    const bExact = b.title.toUpperCase() === qUpper || b.subtitle?.toUpperCase().startsWith(qUpper + " ") ? 1 : 0;
    return bExact - aExact;
  });

  const res = NextResponse.json({ hits: hits.slice(0, 24) });
  // Search results are stable for a session; allow private caching for 60s
  res.headers.set("Cache-Control", "private, max-age=60");
  return res;
}
