/**
 * Google News RSS fetcher — shared by /api/news (live client-side feed) and
 * the market_news_brief cron job (AI summary). Kept in one place so both
 * consumers see the same categories and parsing behavior.
 */

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  pubDateMs: number;
  category: string;
}

export const NEWS_FEEDS: Record<string, string> = {
  finance: "India stock market NSE BSE Nifty Sensex today",
  ipo: "IPO India 2026 allotment listing GMP",
  fii: "FII DII foreign institutional investor India flows",
  deals: "bulk deals block deals promoter selling NSE BSE India",
  policy: "SEBI RBI India market regulation policy interest rate",
  results: "quarterly results earnings Q4 India profit revenue",
};

export async function fetchGoogleNewsFeed(query: string, category: string): Promise<NewsItem[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IPOpulse/1.0)" },
      next: { revalidate: 900 }, // 15-min cache (no-op outside a Next.js request context, e.g. the cron job)
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

export async function fetchAllNewsCategories(): Promise<NewsItem[]> {
  const results = await Promise.all(
    Object.entries(NEWS_FEEDS).map(([key, query]) => fetchGoogleNewsFeed(query, key)),
  );
  const all = results.flat();
  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const item of all.sort((a, b) => b.pubDateMs - a.pubDateMs)) {
    if (!seen.has(item.link)) {
      seen.add(item.link);
      items.push(item);
    }
  }
  return items;
}
