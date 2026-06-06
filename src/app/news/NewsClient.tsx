"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, RefreshCw, Clock } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  pubDateMs: number;
  category: string;
}

const TABS = [
  { key: "all",     label: "All News",   color: "bg-indigo-100 text-indigo-700" },
  { key: "finance", label: "Markets",    color: "bg-blue-100 text-blue-700" },
  { key: "ipo",     label: "IPO",        color: "bg-emerald-100 text-emerald-700" },
  { key: "fii",     label: "FII / DII",  color: "bg-violet-100 text-violet-700" },
  { key: "deals",   label: "Deals",      color: "bg-amber-100 text-amber-700" },
  { key: "results", label: "Results",    color: "bg-rose-100 text-rose-700" },
  { key: "policy",  label: "RBI / SEBI", color: "bg-gray-100 text-gray-700" },
];

const CAT_COLORS: Record<string, string> = {
  finance: "bg-blue-100 text-blue-700",
  ipo:     "bg-emerald-100 text-emerald-700",
  fii:     "bg-violet-100 text-violet-700",
  deals:   "bg-amber-100 text-amber-700",
  results: "bg-rose-100 text-rose-700",
  policy:  "bg-gray-100 text-gray-700",
};

function timeAgo(ms: number): string {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NewsClient() {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (category: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${category}&_=${isRefresh ? Date.now() : ""}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setFetchedAt(data.fetchedAt ?? "");
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
              tab === t.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => load(tab, true)}
          disabled={refreshing}
          className="ml-auto px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Fetch time */}
      {fetchedAt && (
        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Updated {timeAgo(new Date(fetchedAt).getTime())} · Google News RSS · 15-min cache
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          No news found. Try refreshing or check back later.
        </div>
      ) : (
        <div className="space-y-0 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden divide-y divide-gray-100">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 transition group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {tab === "all" && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${CAT_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {item.category === "fii" ? "FII/DII" : item.category === "policy" ? "RBI/SEBI" : item.category}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">{item.source}</span>
                  {item.pubDateMs > 0 && (
                    <span className="text-[11px] text-gray-400">{timeAgo(item.pubDateMs)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-900 font-medium leading-snug group-hover:text-indigo-700 transition line-clamp-2">
                  {item.title}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-1 transition" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
