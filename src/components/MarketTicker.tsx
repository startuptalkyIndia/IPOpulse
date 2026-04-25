import { prisma } from "@/lib/db";
import { TickerStrip } from "./TickerStrip";

export interface TickerItem {
  label: string;
  value?: string;
  delta?: string;
  href?: string;
  tone?: "up" | "down" | "neutral" | "live";
}

export async function MarketTicker() {
  const items: TickerItem[] = [];

  try {
    // Latest FII / DII flow
    const today = await prisma.fiiDiiDaily.findFirst({
      where: { segment: "cash" },
      orderBy: { date: "desc" },
    });
    if (today) {
      const fii = today.fiiNet ? Number(today.fiiNet) : 0;
      const dii = today.diiNet ? Number(today.diiNet) : 0;
      items.push({
        label: "FII",
        value: `₹${Math.abs(fii).toFixed(0)} Cr`,
        delta: fii >= 0 ? "+" : "−",
        tone: fii >= 0 ? "up" : "down",
        href: "/fii-dii",
      });
      items.push({
        label: "DII",
        value: `₹${Math.abs(dii).toFixed(0)} Cr`,
        delta: dii >= 0 ? "+" : "−",
        tone: dii >= 0 ? "up" : "down",
        href: "/fii-dii",
      });
    }

    // Live IPOs
    const liveIpos = await prisma.ipo.findMany({
      where: { status: "live" },
      take: 4,
      orderBy: { closeDate: "asc" },
    });
    for (const ipo of liveIpos) {
      items.push({
        label: "LIVE IPO",
        value: ipo.name,
        tone: "live",
        href: `/ipo/${ipo.slug}`,
      });
    }

    // Upcoming IPOs (next 3)
    const upcoming = await prisma.ipo.findMany({
      where: { status: "upcoming" },
      take: 3,
      orderBy: { openDate: "asc" },
    });
    for (const ipo of upcoming) {
      items.push({
        label: "Upcoming",
        value: `${ipo.name}${ipo.openDate ? ` opens ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(ipo.openDate)}` : ""}`,
        tone: "neutral",
        href: `/ipo/${ipo.slug}`,
      });
    }

    // Recent listings with gain
    const recentListed = await prisma.ipo.findMany({
      where: { status: "listed", listing: { isNot: null } },
      include: { listing: true },
      orderBy: { listingDate: "desc" },
      take: 3,
    });
    for (const ipo of recentListed) {
      const gain = ipo.listing?.listingGainsPct ? Number(ipo.listing.listingGainsPct) : null;
      if (gain == null) continue;
      items.push({
        label: "Listed",
        value: `${ipo.name}: ${gain >= 0 ? "+" : ""}${gain.toFixed(1)}%`,
        tone: gain >= 0 ? "up" : "down",
        href: `/ipo/${ipo.slug}`,
      });
    }

    // Latest BSE announcement
    const latestAnn = await prisma.announcement.findMany({
      orderBy: { broadcastAt: "desc" },
      take: 4,
    });
    for (const a of latestAnn) {
      items.push({
        label: "BSE",
        value: a.headline.slice(0, 90) + (a.headline.length > 90 ? "…" : ""),
        tone: "neutral",
      });
    }
  } catch {
    // DB unreachable — fall through to static fallback
  }

  if (items.length === 0) {
    items.push(
      { label: "IPOpulse", value: "India's structured market data hub", tone: "neutral", href: "/" },
      { label: "20 calculators", value: "SIP · EMI · Tax · LTCG · Brokerage · more", tone: "neutral", href: "/calculators" },
      { label: "Cmd+K", value: "Search any IPO, stock or calculator", tone: "neutral" },
      { label: "Live IPOs", value: "Track open issues with GMP & subscription", tone: "live", href: "/ipo/live" },
    );
  }

  return <TickerStrip items={items} />;
}
