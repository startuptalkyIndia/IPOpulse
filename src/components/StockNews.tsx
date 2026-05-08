/**
 * StockNews — server component
 * Fetches recent news for a company from Google News RSS (free, no API key).
 * Falls back to BSE announcements from DB if RSS fails.
 *
 * Usage: <StockNews symbol="RELIANCE" name="Reliance Industries" companyId={1} />
 */

import Link from "next/link";
import { ExternalLink, Newspaper, FileText } from "lucide-react";
import { prisma } from "@/lib/db";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  type: "news" | "announcement";
}

async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    const encoded = encodeURIComponent(`${query} stock NSE India`);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IPOpulse/1.0)" },
      next: { revalidate: 1800 }, // cache 30 min
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Parse RSS items
    const items: NewsItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? content.match(/<title>(.*?)<\/title>/)?.[1]
        ?? "";
      const link = content.match(/<link>(.*?)<\/link>/)?.[1]
        ?? content.match(/<link\s+href="([^"]+)"/)?.[1]
        ?? "";
      const source = content.match(/<source[^>]*>(.*?)<\/source>/)?.[1]
        ?? content.match(/- (.*?)$/)?.[1]
        ?? "Google News";
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

      if (title && link) {
        items.push({
          title: title.replace(/ - [^-]+$/, "").trim(), // strip "- Source Name" suffix
          link,
          source: source.trim(),
          pubDate,
          type: "news",
        });
      }
      if (items.length >= 6) break;
    }
    return items;
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr.slice(0, 10);
  }
}

interface Props {
  symbol: string | null;
  name: string;
  companyId: number;
}

export async function StockNews({ symbol, name, companyId }: Props) {
  // Fetch news and DB announcements in parallel
  const [newsItems, dbAnnouncements] = await Promise.all([
    fetchGoogleNews(symbol ?? name),
    prisma.announcement.findMany({
      where: { companyId },
      orderBy: { broadcastAt: "desc" },
      take: 4,
      select: { id: true, headline: true, category: true, broadcastAt: true, pdfUrl: true },
    }),
  ]);

  // Merge DB announcements as items
  const dbItems: NewsItem[] = dbAnnouncements.map((a) => ({
    title: a.headline,
    link: a.pdfUrl ?? "#",
    source: "BSE Filing",
    pubDate: a.broadcastAt.toISOString(),
    type: "announcement" as const,
  }));

  const allItems = [...newsItems, ...dbItems].slice(0, 8);

  if (allItems.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-indigo-500" /> News & Filings
        </h2>
        <p className="text-sm text-gray-400">No recent news found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-indigo-500" />
        News & Filings
        <span className="text-xs font-normal text-gray-400 ml-auto">Google News + BSE</span>
      </h2>
      <ul className="space-y-0 divide-y divide-gray-100">
        {allItems.map((item, i) => (
          <li key={i} className="py-2.5">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
            >
              {item.type === "announcement" ? (
                <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 group-hover:text-indigo-700 leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-400">{item.source}</span>
                  {item.pubDate && (
                    <span className="text-[11px] text-gray-400">· {formatDate(item.pubDate)}</span>
                  )}
                  {item.type === "announcement" && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">BSE</span>
                  )}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-gray-400 mt-2">
        News via Google News · Not verified by IPOpulse · Not investment advice
      </p>
    </div>
  );
}
