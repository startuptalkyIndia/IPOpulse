"use client";

import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";

export function ListingCountdown({ listingDate }: { listingDate: string }) {
  const target = new Date(listingDate);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return (
    <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
      <div className="flex items-center gap-2 mb-3">
        <Hourglass className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Listing countdown</h3>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { v: days, l: "Days" },
          { v: hours, l: "Hours" },
          { v: minutes, l: "Min" },
          { v: seconds, l: "Sec" },
        ].map((c) => (
          <div key={c.l} className="bg-white rounded-lg border border-indigo-100 py-2">
            <div className="text-xl md:text-2xl font-bold text-indigo-700 tabular-nums">
              {String(c.v).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">{c.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
