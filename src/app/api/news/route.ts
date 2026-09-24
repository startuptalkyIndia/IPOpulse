import { NextRequest, NextResponse } from "next/server";
import { NEWS_FEEDS, fetchGoogleNewsFeed, fetchAllNewsCategories } from "@/lib/scrapers/google-news";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category") ?? "all";

  const items = cat === "all"
    ? (await fetchAllNewsCategories()).slice(0, 60)
    : NEWS_FEEDS[cat]
      ? await fetchGoogleNewsFeed(NEWS_FEEDS[cat], cat)
      : [];

  const res = NextResponse.json({ items, fetchedAt: new Date().toISOString() });
  // News is public and changes every ~15 min; cache at CDN + browser
  res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res;
}
