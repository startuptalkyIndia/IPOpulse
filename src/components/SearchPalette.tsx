"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, TrendingUp, LineChart, Calculator, PieChart, Users, Layers } from "lucide-react";

interface Hit {
  type: "ipo" | "stock" | "calculator" | "sector" | "investor" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

const iconForType = {
  ipo: TrendingUp,
  stock: LineChart,
  calculator: Calculator,
  sector: PieChart,
  investor: Users,
  page: FileText,
};

const colorForType: Record<Hit["type"], string> = {
  ipo: "bg-green-100 text-green-700",
  stock: "bg-indigo-100 text-indigo-700",
  calculator: "bg-purple-100 text-purple-700",
  sector: "bg-yellow-100 text-yellow-800",
  investor: "bg-blue-100 text-blue-700",
  page: "bg-gray-100 text-gray-700",
};

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((s) => !s);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQ("");
      setHits([]);
      setActive(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!q || q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const body = await res.json().catch(() => ({ hits: [] }));
      if (!cancelled) setHits(body.hits ?? []);
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(hits.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active].href);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200"
        aria-label="Open search (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search…</span>
        <kbd className="hidden lg:inline-block font-mono bg-white border border-gray-300 rounded px-1 text-[10px]">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-gray-200">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search IPOs, stocks, calculators, sectors…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            className="w-full pl-11 pr-12 py-3.5 text-sm focus:outline-none"
          />
          <button onClick={() => setOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {q.length < 2 ? (
            <div className="px-4 py-8 text-sm text-gray-400 text-center">
              Type to search IPOs, stocks, calculators, sectors, super investors…
            </div>
          ) : hits.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-400 text-center">No results for &quot;{q}&quot;</div>
          ) : (
            <ul>
              {hits.map((h, i) => {
                const Icon = iconForType[h.type] ?? Layers;
                return (
                  <li key={`${h.type}-${h.href}-${i}`}>
                    <button
                      onClick={() => go(h.href)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        active === i ? "bg-indigo-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${colorForType[h.type]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{h.title}</span>
                        {h.subtitle ? (
                          <span className="block text-xs text-gray-500 truncate">{h.subtitle}</span>
                        ) : null}
                      </span>
                      <span className="text-[10px] text-gray-400 capitalize">{h.type}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 flex justify-between">
          <span>↑↓ navigate · ↵ open · Esc close</span>
          <span><kbd className="font-mono bg-gray-100 px-1 rounded">⌘K</kbd></span>
        </div>
      </div>
    </div>
  );
}
