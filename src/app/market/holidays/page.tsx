import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "NSE BSE Market Holidays 2026 — Stock Market Holiday Calendar",
  description:
    "Complete list of NSE and BSE stock market holidays for 2026. Know which dates the Indian equity market is closed, including Diwali Muhurat Trading session timings.",
  alternates: { canonical: "/market/holidays" },
};

interface Holiday {
  date: string;
  day: string;
  name: string;
  special?: string;
}

const holidays2026: Holiday[] = [
  { date: "26 Jan 2026", day: "Monday", name: "Republic Day" },
  { date: "19 Feb 2026", day: "Thursday", name: "Chhatrapati Shivaji Maharaj Jayanti" },
  { date: "26 Feb 2026", day: "Thursday", name: "Mahashivratri" },
  { date: "20 Mar 2026", day: "Friday", name: "Holi" },
  { date: "2 Apr 2026", day: "Thursday", name: "Ram Navami" },
  { date: "3 Apr 2026", day: "Friday", name: "Good Friday" },
  { date: "14 Apr 2026", day: "Tuesday", name: "Dr. Baba Saheb Ambedkar Jayanti / Mahavir Jayanti" },
  { date: "1 May 2026", day: "Friday", name: "Maharashtra Day / May Day" },
  { date: "15 Aug 2026", day: "Saturday", name: "Independence Day", special: "Saturday — market closed" },
  { date: "27 Aug 2026", day: "Thursday", name: "Ganesh Chaturthi" },
  { date: "2 Oct 2026", day: "Friday", name: "Gandhi Jayanti / Dussehra" },
  {
    date: "22 Oct 2026",
    day: "Thursday",
    name: "Diwali — Laxmi Puja",
    special: "Muhurat Trading session 6:00–7:00 PM IST",
  },
  { date: "23 Oct 2026", day: "Friday", name: "Diwali — Balipratipada" },
  { date: "25 Nov 2026", day: "Wednesday", name: "Gurunanak Jayanti" },
  { date: "25 Dec 2026", day: "Friday", name: "Christmas" },
];

const currentDate = new Date("2026-05-09");

function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export default function MarketHolidaysPage() {
  const upcoming = holidays2026.filter((h) => parseDate(h.date) >= currentDate);
  const passed = holidays2026.filter((h) => parseDate(h.date) < currentDate);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Calendar className="w-3.5 h-3.5" />
          NSE · BSE Equity Segment · 2026
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Stock Market Holidays 2026
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
          Official NSE and BSE trading holidays for the Indian equity segment. The market is also
          closed on all Saturdays and Sundays. Settlement follows T+1 — verify with exchange website for final confirmation.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-indigo-700">{holidays2026.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Holidays</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-emerald-600">{upcoming.length}</div>
          <div className="text-xs text-gray-500 mt-1">Remaining in 2026</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-500">{passed.length}</div>
          <div className="text-xs text-gray-500 mt-1">Already Passed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-600">1</div>
          <div className="text-xs text-gray-500 mt-1">Muhurat Session</div>
        </div>
      </div>

      {/* Upcoming holidays */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Upcoming Holidays
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Holiday</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((h) => (
                  <tr key={h.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {h.date.split(" 2026")[0]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{h.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{h.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {h.special ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {h.special}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Market closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Passed holidays */}
      {passed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-500 mb-3">Passed Holidays</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden opacity-70">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-400 uppercase">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Day</th>
                  <th className="px-4 py-2.5">Holiday</th>
                </tr>
              </thead>
              <tbody>
                {passed.map((h) => (
                  <tr key={h.date} className="border-b border-gray-100">
                    <td className="px-4 py-2.5 text-sm text-gray-400">{h.date.split(" 2026")[0]}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-400">{h.day}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-400">{h.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Muhurat Trading info */}
      <div className="card mb-8 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Diwali Muhurat Trading — 22 Oct 2026</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              NSE and BSE conduct a special 60-minute evening session on Diwali (Laxmi Puja), typically
              <strong> 6:00 PM – 7:00 PM IST</strong>. Despite the market holiday, this session is open for
              equity, F&amp;O, SLB, and currency segments. Volume is symbolic — many investors make small
              purchases for auspicious reasons. Normal T+1 settlement applies.
            </p>
          </div>
        </div>
      </div>

      {/* Market timings */}
      <section className="card mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Regular Market Timings (Trading Days)</h2>
        <div className="space-y-3">
          {[
            { label: "Pre-Open Session", time: "9:00 AM – 9:15 AM", desc: "Order collection & price discovery" },
            { label: "Normal Market (Equity)", time: "9:15 AM – 3:30 PM", desc: "Regular trading for all securities" },
            { label: "Post-Close Session", time: "3:40 PM – 4:00 PM", desc: "Closing price orders (delivery segment)" },
            { label: "After-Market Orders (AMO)", time: "After 4:00 PM", desc: "Orders placed for next day opening" },
          ].map((row) => (
            <div key={row.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900">{row.label}</div>
                <div className="text-xs text-gray-500">{row.desc}</div>
              </div>
              <div className="text-sm font-mono text-indigo-700 font-semibold">{row.time}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Settlement info */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">T+1 Settlement (Since Jan 2023)</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Shares bought on a trading day are credited to your demat account the <strong>next business day</strong>.
          If you buy on Friday (before a Monday holiday), shares arrive on Tuesday. NSE/BSE are
          among the fastest settling major exchanges globally. SEBI is evaluating T+0 (same-day)
          settlement for select securities.
        </p>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/learn" className="card hover:border-indigo-300 transition text-center">
          <div className="text-sm font-semibold text-gray-900 mb-1">Learning Hub</div>
          <div className="text-xs text-gray-500">Guides on IPO, Nifty, investing basics</div>
        </Link>
        <Link href="/fii-dii" className="card hover:border-indigo-300 transition text-center">
          <div className="text-sm font-semibold text-gray-900 mb-1">FII/DII Activity</div>
          <div className="text-xs text-gray-500">Daily institutional buying & selling data</div>
        </Link>
      </div>
    </div>
  );
}
