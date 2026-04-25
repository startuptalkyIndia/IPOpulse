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

  // DB: IPOs and companies
  try {
    const [ipos, companies] = await Promise.all([
      prisma.ipo.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { name: true, slug: true, type: true, status: true },
        take: 8,
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nseSymbol: { contains: q.toUpperCase() } },
            { bseCode: { equals: q } },
          ],
          active: true,
        },
        select: { name: true, slug: true, sector: true, nseSymbol: true },
        take: 8,
      }),
    ]);

    for (const i of ipos) {
      hits.push({
        type: "ipo",
        title: i.name,
        subtitle: `${i.type === "sme" ? "SME" : "Mainboard"} · ${i.status}`,
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

  return NextResponse.json({ hits: hits.slice(0, 24) });
}
