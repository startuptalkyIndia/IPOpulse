"use client";

import Link from "next/link";
import type { TickerItem } from "./MarketTicker";
import { TrendingUp, TrendingDown, Activity, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TickerStrip({ items }: { items: TickerItem[] }) {
  // Duplicate items so the loop is seamless
  const loop = [...items, ...items];
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Pause scrolling when offscreen to save CPU
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setPaused(!e.isIntersecting)),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="bg-gray-900 text-white border-b border-gray-800 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes ipopulse-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ipopulse-ticker-track {
          animation: ipopulse-ticker 80s linear infinite;
        }
        .ipopulse-ticker-track[data-paused="true"] {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1">
          <Radio className="w-3 h-3" /> Live
        </div>
        <div className="pl-16">
          <div ref={trackRef} className="ipopulse-ticker-track flex whitespace-nowrap" data-paused={paused}>
            {loop.map((item, i) => (
              <TickerCell key={i} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerCell({ item }: { item: TickerItem }) {
  const Icon = item.tone === "up" ? TrendingUp : item.tone === "down" ? TrendingDown : item.tone === "live" ? Radio : Activity;
  const cls =
    item.tone === "up"
      ? "text-green-400"
      : item.tone === "down"
      ? "text-red-400"
      : item.tone === "live"
      ? "text-orange-400"
      : "text-gray-300";
  const inner = (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs">
      <Icon className={`w-3 h-3 ${cls}`} />
      <span className={`font-semibold uppercase tracking-wider text-[10px] ${cls}`}>{item.label}</span>
      {item.value ? (
        <span className="text-gray-100">
          {item.delta ? <span className={`mr-0.5 ${cls}`}>{item.delta}</span> : null}
          {item.value}
        </span>
      ) : null}
      <span className="mx-3 text-gray-600">•</span>
    </span>
  );
  if (item.href) {
    return (
      <Link href={item.href} className="hover:bg-gray-800 transition-colors">
        {inner}
      </Link>
    );
  }
  return inner;
}
