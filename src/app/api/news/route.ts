import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  pubDateMs: number;
  category: string;
}

const FEEDS: Record<string, string> = {
  finance: "India stock market NSE BSE Nifty Sensex today",
  ipo:     "IPO India 2026 allotment listing GMP",
  fii:     "FII DII foreign institutional investor India flows",
  deals:   "bulk deals block deals promoter selling NSE BSE India",
  policy:  "SEBI RBI India market regulation policy interest rate",
  results: "quarterly results earnings Q4 India profit revenue",
};

async function fetchFeed(query: string, category: string): Promise<NewsItem[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IPOpulse/1.0)" },
      next: { revalidate: 900 }, // 15-min cache
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: NewsItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const link = content.match(/<link>(.*?)<\/link>/)?.[1]
        ?? content.match(/<link\s+href="([^"]+)"/)?.[1] ?? "";
      const source = content.match(/<source[^>]*>(.*?)<\/source>/)?.[1] ?? "Google News";
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      const pubDateMs = pubDate ? new Date(pubDate).getTime() : 0;

      if (title && link && !title.includes("...")) {
        items.push({ title, link, source, pubDate, pubDateMs, category });
      }
    }
    return items.slice(0, 15);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category") ?? "all";

  let items: NewsItem[] = [];

  if (cat === "all") {
    // Fetch all categories in parallel, mix and sort by recency
    const results = await Promise.all(
      Object.entries(FEEDS).map(([key, query]) => fetchFeed(query, key))
    );
    const all = results.flat();
    // Deduplicate by link, sort by date
    const seen = new Set<string>();
    for (const item of all.sort((a, b) => b.pubDateMs - a.pubDateMs)) {
      if (!seen.has(item.link)) {
        seen.add(item.link);
        items.push(item);
      }
    }
    items = items.slice(0, 60);
  } else {
    const query = FEEDS[cat];
    if (!query) return NextResponse.json({ items: [] });
    items = await fetchFeed(query, cat);
  }

  return NextResponse.json({ items, fetchedAt: new Date().toISOString() });
}
