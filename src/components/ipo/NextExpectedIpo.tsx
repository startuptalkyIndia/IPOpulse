import { CalendarClock } from "lucide-react";
import type { ExpectedIpo } from "@/lib/expected-ipos";

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** Unconfirmed heads-up shown when no IPO is in the upcoming table yet. */
export function NextExpectedIpo({ ipos, now = new Date() }: { ipos: ExpectedIpo[]; now?: Date }) {
  if (ipos.length === 0) return null;
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return (
    <div className="card border-dashed" data-testid="next-expected-ipo">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
        <CalendarClock className="w-4 h-4 text-indigo-600" />
        Next expected {ipos.length > 1 ? "IPOs" : "IPO"}
      </div>
      <ul className="space-y-1.5">
        {ipos.map((i, idx) => (
          <li key={`${idx}-${i.name}`} className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">{i.name}</span>{" "}
            <span className="text-gray-500">({i.boardType || "IPO"})</span> —{" "}
            {i.openDate.getTime() > todayUtc ? `opens ${fmt(i.openDate)}` : `opened ${fmt(i.openDate)}`}
            {i.closeDate ? `, closes ${fmt(i.closeDate)}` : ""}.{" "}
            {i.priceBandHigh ? `Price band up to ₹${i.priceBandHigh}.` : "Price band not announced yet."}
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-2">
        Unconfirmed: dates are reported by a third-party tracker and can change. This IPO is not yet on the
        NSE issue list; it moves into the table above once it is.
      </p>
    </div>
  );
}
