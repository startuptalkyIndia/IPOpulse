import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Info, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "F&O Expiry Calendar 2026 — NSE Futures Options Monthly Weekly Expiry Dates",
  description:
    "Complete F&O expiry calendar for 2026. NSE monthly expiry (last Thursday), weekly expiry (every Thursday), adjusted for market holidays. Nifty 50, Bank Nifty, Fin Nifty, Nifty Midcap lot sizes.",
  alternates: { canonical: "/market/fo-expiry" },
};

// Known 2026 market holidays that fall on Thursday
const THURSDAY_HOLIDAYS = new Set([
  "2026-02-26", // Mahashivratri
  "2026-04-02", // Ram Navami
  "2026-11-25", // Gurunanak Jayanti
]);

function isThursdayHoliday(date: Date): boolean {
  const iso = date.toISOString().slice(0, 10);
  return THURSDAY_HOLIDAYS.has(iso);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", weekday: "short" });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Get last Thursday of a given month/year
function lastThursdayOfMonth(year: number, month: number): Date {
  // month is 0-indexed in JS Date
  // Start from last day of month, go backwards to Thursday
  const lastDay = new Date(year, month + 1, 0); // last day of month
  const dow = lastDay.getDay(); // 0=Sun, 4=Thu
  const daysBack = (dow >= 4) ? dow - 4 : dow + 3;
  const thursday = new Date(year, month, lastDay.getDate() - daysBack);

  // If it's a holiday, move to Wednesday
  if (isThursdayHoliday(thursday)) {
    return addDays(thursday, -1);
  }
  return thursday;
}

// Get all Thursdays in a month
function allThursdaysInMonth(year: number, month: number): Date[] {
  const thursdays: Date[] = [];
  const d = new Date(year, month, 1);
  // Move to first Thursday
  while (d.getDay() !== 4) {
    d.setDate(d.getDate() + 1);
  }
  while (d.getMonth() === month) {
    const candidate = new Date(d);
    if (isThursdayHoliday(candidate)) {
      // Move to Wednesday
      thursdays.push(addDays(candidate, -1));
    } else {
      thursdays.push(candidate);
    }
    d.setDate(d.getDate() + 7);
  }
  return thursdays;
}

interface MonthData {
  monthName: string;
  monthIndex: number;
  monthlyExpiry: Date;
  weeklyExpiries: Date[];
  isMonthlyHolidayAdjusted: boolean;
}

function buildCalendar(): MonthData[] {
  const months: MonthData[] = [];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  for (let m = 0; m < 12; m++) {
    const monthly = lastThursdayOfMonth(2026, m);
    const rawLastThursday = (() => {
      const lastDay = new Date(2026, m + 1, 0);
      const dow = lastDay.getDay();
      const daysBack = (dow >= 4) ? dow - 4 : dow + 3;
      return new Date(2026, m, lastDay.getDate() - daysBack);
    })();

    const isMonthlyHolidayAdjusted = isThursdayHoliday(rawLastThursday);

    const allWeeklies = allThursdaysInMonth(2026, m);
    // Weekly expiries = all Thursdays in the month (monthly is one of them, shown distinctly)

    months.push({
      monthName: monthNames[m],
      monthIndex: m,
      monthlyExpiry: monthly,
      weeklyExpiries: allWeeklies,
      isMonthlyHolidayAdjusted,
    });
  }
  return months;
}

const CURRENT_DATE = new Date("2026-05-09");

function daysUntil(d: Date): number {
  const diff = d.getTime() - CURRENT_DATE.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function findNextExpiry(months: MonthData[]): { date: Date; label: string } | null {
  for (const month of months) {
    for (const weekly of month.weeklyExpiries) {
      if (weekly >= CURRENT_DATE) {
        const isMonthly = weekly.toDateString() === month.monthlyExpiry.toDateString();
        return {
          date: weekly,
          label: isMonthly ? `${month.monthName} Monthly + Weekly` : `${month.monthName} Weekly`,
        };
      }
    }
  }
  return null;
}

const calendar = buildCalendar();
const nextExpiry = findNextExpiry(calendar);

const FOT_FACTS = [
  { index: "Nifty 50", lotSize: 75, exchange: "NSE" },
  { index: "Bank Nifty", lotSize: 30, exchange: "NSE" },
  { index: "Nifty Midcap 50", lotSize: 120, exchange: "NSE" },
  { index: "Fin Nifty", lotSize: 65, exchange: "NSE" },
  { index: "Sensex", lotSize: 10, exchange: "BSE" },
];

export default function FoExpiryPage() {
  const currentMonthIndex = CURRENT_DATE.getMonth(); // 4 = May

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Calendar className="w-3.5 h-3.5" />
          NSE · BSE F&amp;O Segment · 2026
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">F&amp;O Expiry Calendar 2026</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Monthly and weekly F&amp;O expiry dates for NSE/BSE. Monthly expiry falls on the last Thursday of each month.
          Weekly expiry is every Thursday. If Thursday is a market holiday, expiry moves to Wednesday.
        </p>
      </div>

      {/* Next expiry countdown */}
      {nextExpiry && (
        <div className="card bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide mb-0.5">Next Expiry</div>
              <div className="text-lg font-bold text-gray-900">{formatDate(nextExpiry.date)}</div>
              <div className="text-sm text-gray-600">{nextExpiry.label}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-bold text-indigo-700 tabular-nums">{daysUntil(nextExpiry.date)}</div>
              <div className="text-xs text-gray-500">days away</div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday adjustment note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong>2026 Thursday holiday adjustments:</strong>{" "}
            26 Feb (Mahashivratri), 2 Apr (Ram Navami), 25 Nov (Gurunanak Jayanti) — expiry moves to Wednesday for these weeks.
            Independence Day (15 Aug) is a Saturday and does not affect Thursday expiry.
          </div>
        </div>
      </div>

      {/* Monthly calendar grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Full Year 2026 — Month by Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {calendar.map((month) => {
            const isCurrentMonth = month.monthIndex === currentMonthIndex;
            const isPastMonth = month.monthIndex < currentMonthIndex;

            return (
              <div
                key={month.monthName}
                className={`card ${isCurrentMonth ? "ring-2 ring-indigo-500 border-indigo-300" : ""} ${isPastMonth ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {month.monthName}
                    {isCurrentMonth && (
                      <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </h3>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Monthly Expiry</div>
                    <div className={`text-sm font-bold ${month.isMonthlyHolidayAdjusted ? "text-amber-600" : "text-indigo-700"}`}>
                      {formatShortDate(month.monthlyExpiry)}
                      {month.isMonthlyHolidayAdjusted && " (Wed)"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Weekly Expiries</div>
                  {month.weeklyExpiries.map((w, i) => {
                    const isMonthly = w.toDateString() === month.monthlyExpiry.toDateString();
                    const isOriginalThursHoliday = THURSDAY_HOLIDAYS.has(addDays(w, 1).toISOString().slice(0, 10));
                    const isPast = w < CURRENT_DATE;

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg ${
                          isMonthly
                            ? "bg-indigo-100 text-indigo-800 font-semibold"
                            : "bg-gray-50 text-gray-700"
                        } ${isPast ? "opacity-50" : ""}`}
                      >
                        <span>{formatShortDate(w)} {isOriginalThursHoliday ? "(Wed)" : "(Thu)"}</span>
                        <div className="flex items-center gap-1">
                          {isMonthly && (
                            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Monthly</span>
                          )}
                          {!isPast && (
                            <span className="text-gray-400">{daysUntil(w)}d</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key F&O facts */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900">Key F&amp;O Facts — Lot Sizes 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Index</th>
                <th className="px-4 py-3">Exchange</th>
                <th className="px-4 py-3">Lot Size (units)</th>
                <th className="px-4 py-3 hidden sm:table-cell">What it means</th>
              </tr>
            </thead>
            <tbody>
              {FOT_FACTS.map((f) => (
                <tr key={f.index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{f.index}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.exchange}</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-700">{f.lotSize}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    1 contract = {f.lotSize} units of the index
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          Lot sizes are set by SEBI and can change. Minimum contract value must be ≥ ₹5 lakh. Always verify current lot sizes on NSE/BSE website before placing orders.
        </div>
      </div>

      {/* F&O basics explainer */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">How F&amp;O Expiry Works</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Monthly expiry:</strong> The last Thursday of every calendar month. This is when monthly futures and options contracts expire. All open positions must be squared off or exercised by 3:30 PM on expiry day.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Weekly expiry:</strong> NSE introduced weekly options for Nifty 50 and Bank Nifty. Every Thursday is a weekly expiry. The weekly expiry that falls in the last week of the month is also the monthly expiry.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Holiday adjustment:</strong> If Thursday is a market holiday, the expiry shifts to the previous trading day (Wednesday). This is the NSE rule — no exceptions. Check the holiday-adjusted dates in this calendar.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Settlement:</strong> Index options (Nifty, Bank Nifty) are cash-settled based on the final settlement price — the average of the index from 3:00 PM to 3:30 PM on expiry day. Stock F&O can be physically delivered (take delivery or give delivery of shares).
            </div>
          </div>
        </div>
      </div>

      {/* Related links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/market/holidays" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Market Holidays 2026</div>
          <div className="text-xs text-gray-500">Full NSE/BSE trading holiday calendar</div>
        </Link>
        <Link href="/market/economic-calendar" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Economic Calendar</div>
          <div className="text-xs text-gray-500">RBI MPC, CPI, GDP, FOMC dates</div>
        </Link>
        <Link href="/calculators/fno-margin" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">F&amp;O Margin Calculator</div>
          <div className="text-xs text-gray-500">Calculate SPAN and exposure margins</div>
        </Link>
      </div>
    </div>
  );
}
