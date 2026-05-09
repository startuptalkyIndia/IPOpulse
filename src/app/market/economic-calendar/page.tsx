import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, TrendingUp, Info, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Economic Calendar India 2026 — RBI MPC, CPI, GDP, Fed Meeting Dates",
  description:
    "Complete economic calendar for India 2026. RBI Monetary Policy Committee meeting dates, India CPI inflation, GDP releases, US FOMC meetings, Union Budget, and key macro events that move Indian markets.",
  alternates: { canonical: "/market/economic-calendar" },
};

type EventType = "rbi" | "india-cpi" | "india-gdp" | "fomc" | "budget" | "us-cpi" | "other";

interface EconomicEvent {
  date: string;
  event: string;
  type: EventType;
  detail: string;
  impact: "high" | "medium" | "low";
}

const events: EconomicEvent[] = [
  // January 2026
  { date: "2026-01-09", event: "US CPI (Dec 2025)", type: "us-cpi", detail: "US Consumer Price Index for December 2025. High print can delay Fed cuts.", impact: "medium" },
  { date: "2026-01-16", event: "India CPI (Dec 2025)", type: "india-cpi", detail: "India's retail inflation for December 2025. Key input for RBI policy.", impact: "high" },
  { date: "2026-01-28", event: "US FOMC Meeting", type: "fomc", detail: "Federal Reserve rate decision. Jan/Mar meetings are historically hold months.", impact: "high" },
  { date: "2026-01-30", event: "India GDP Q3 FY26 (advance)", type: "india-gdp", detail: "First advance estimate of GDP for Oct-Dec 2025 quarter.", impact: "high" },

  // February 2026
  { date: "2026-02-01", event: "Union Budget 2026-27", type: "budget", detail: "India's annual Union Budget presented by Finance Minister. Already happened — full-year fiscal roadmap is known.", impact: "high" },
  { date: "2026-02-13", event: "US CPI (Jan 2026)", type: "us-cpi", detail: "January US inflation print. First reading of 2026 — sets Fed tone for H1.", impact: "medium" },
  { date: "2026-02-17", event: "India CPI (Jan 2026)", type: "india-cpi", detail: "January India CPI. RBI watches this closely for the February policy.", impact: "high" },
  { date: "2026-02-06", event: "RBI MPC Meeting (Feb 2026)", type: "rbi", detail: "Bi-monthly monetary policy review. Repo rate decision announced on last day (typically Day 3).", impact: "high" },

  // March 2026
  { date: "2026-03-13", event: "US CPI (Feb 2026)", type: "us-cpi", detail: "February US CPI. Crucial ahead of March FOMC.", impact: "medium" },
  { date: "2026-03-16", event: "India CPI (Feb 2026)", type: "india-cpi", detail: "February India retail inflation. Monsoon/food base effects typically visible.", impact: "high" },
  { date: "2026-03-18", event: "US FOMC Meeting", type: "fomc", detail: "March FOMC — one of the more actionable meetings. Fed SEP (dot plot) released.", impact: "high" },

  // April 2026
  { date: "2026-04-07", event: "RBI MPC Meeting (Apr 2026)", type: "rbi", detail: "April bi-monthly policy. Post-budget, pre-summer assessment of growth and inflation.", impact: "high" },
  { date: "2026-04-10", event: "US CPI (Mar 2026)", type: "us-cpi", detail: "March US CPI. Full Q1 inflation picture for 2026.", impact: "medium" },
  { date: "2026-04-14", event: "India CPI (Mar 2026)", type: "india-cpi", detail: "March India CPI — FY25-26 year-end reading. Base effects from last year's high summer prices.", impact: "high" },
  { date: "2026-04-29", event: "US FOMC Meeting", type: "fomc", detail: "April/May FOMC. Markets watch for any pivot signals ahead of summer.", impact: "high" },
  { date: "2026-04-30", event: "India GDP Q4 FY26", type: "india-gdp", detail: "GDP estimate for January-March 2026 quarter and full-year FY26 advance estimate.", impact: "high" },

  // May 2026
  { date: "2026-05-12", event: "US CPI (Apr 2026)", type: "us-cpi", detail: "April US CPI. Warm-month energy and services inflation reading.", impact: "medium" },
  { date: "2026-05-14", event: "India CPI (Apr 2026)", type: "india-cpi", detail: "April India CPI. Summer vegetables and fuel typically push numbers up.", impact: "high" },

  // June 2026
  { date: "2026-06-05", event: "RBI MPC Meeting (Jun 2026)", type: "rbi", detail: "June policy review — mid-year check. Monsoon forecast and Q1 GDP estimates guide the decision.", impact: "high" },
  { date: "2026-06-11", event: "US CPI (May 2026)", type: "us-cpi", detail: "May US CPI. Pre-FOMC data. Markets are very sensitive to this print.", impact: "medium" },
  { date: "2026-06-12", event: "India CPI (May 2026)", type: "india-cpi", detail: "May India CPI. Monsoon onset impact on vegetable prices often visible.", impact: "high" },
  { date: "2026-06-17", event: "US FOMC Meeting", type: "fomc", detail: "June FOMC — dot plot update. One of the four quarterly SEP meetings.", impact: "high" },

  // July 2026
  { date: "2026-07-10", event: "US CPI (Jun 2026)", type: "us-cpi", detail: "June US CPI. H1 2026 inflation summary for the Fed.", impact: "medium" },
  { date: "2026-07-14", event: "India CPI (Jun 2026)", type: "india-cpi", detail: "June India CPI. Kharif sowing updates alongside inflation.", impact: "high" },
  { date: "2026-07-29", event: "US FOMC Meeting", type: "fomc", detail: "July FOMC. Typically a hold meeting unless data is extreme.", impact: "medium" },

  // August 2026
  { date: "2026-08-07", event: "RBI MPC Meeting (Aug 2026)", type: "rbi", detail: "August policy — post-monsoon progress, kharif crop output assessment affects food inflation outlook.", impact: "high" },
  { date: "2026-08-13", event: "US CPI (Jul 2026)", type: "us-cpi", detail: "July US CPI. Typically the peak summer energy reading.", impact: "medium" },
  { date: "2026-08-14", event: "India CPI (Jul 2026)", type: "india-cpi", detail: "July India CPI. Monsoon flooding or deficit shows in vegetable prices.", impact: "high" },
  { date: "2026-08-28", event: "India GDP Q1 FY27 (Apr-Jun 2026)", type: "india-gdp", detail: "First quarter FY27 GDP. Sets the tone for full-year growth forecasts.", impact: "high" },

  // September 2026
  { date: "2026-09-11", event: "US CPI (Aug 2026)", type: "us-cpi", detail: "August US CPI. Pre-September FOMC — most watched print of the quarter.", impact: "medium" },
  { date: "2026-09-14", event: "India CPI (Aug 2026)", type: "india-cpi", detail: "August India CPI. Post-monsoon assessment — festive season demand impact.", impact: "high" },
  { date: "2026-09-16", event: "US FOMC Meeting", type: "fomc", detail: "September FOMC — dot plot. Historically the most likely month for rate moves.", impact: "high" },

  // October 2026
  { date: "2026-10-05", event: "RBI MPC Meeting (Oct 2026)", type: "rbi", detail: "October policy — post-kharif harvest, festive season demand, and early rabi sowing assessment.", impact: "high" },
  { date: "2026-10-12", event: "US CPI (Sep 2026)", type: "us-cpi", detail: "September US CPI. Q3 close-out — full picture of H2 inflation direction.", impact: "medium" },
  { date: "2026-10-14", event: "India CPI (Sep 2026)", type: "india-cpi", detail: "September India CPI. Festive demand often pushes WPI and CPI higher.", impact: "high" },
  { date: "2026-10-28", event: "US FOMC Meeting", type: "fomc", detail: "October/November FOMC. Typically a hold unless September data was extreme.", impact: "medium" },
  { date: "2026-10-30", event: "India GDP Q2 FY27 (Jul-Sep 2026)", type: "india-gdp", detail: "Second quarter FY27 GDP. Monsoon and festive season impact on growth.", impact: "high" },

  // November 2026
  { date: "2026-11-11", event: "US CPI (Oct 2026)", type: "us-cpi", detail: "October US CPI. Post-festive US demand and base effects.", impact: "medium" },
  { date: "2026-11-13", event: "India CPI (Oct 2026)", type: "india-cpi", detail: "October India CPI. Diwali month — gold, consumer goods demand peaks.", impact: "high" },

  // December 2026
  { date: "2026-12-04", event: "RBI MPC Meeting (Dec 2026)", type: "rbi", detail: "December policy — year-end review. RBI sets tone for the coming financial year's first half.", impact: "high" },
  { date: "2026-12-10", event: "US CPI (Nov 2026)", type: "us-cpi", detail: "November US CPI. Pre-December FOMC. Holiday spending season inflation.", impact: "medium" },
  { date: "2026-12-14", event: "India CPI (Nov 2026)", type: "india-cpi", detail: "November India CPI. Winter vegetables, rabi crop outlook, and demand-side factors.", impact: "high" },
  { date: "2026-12-16", event: "US FOMC Meeting", type: "fomc", detail: "December FOMC — final meeting of 2026 with dot plot. Sets tone for 2027.", impact: "high" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; dot: string }> = {
  rbi:       { label: "RBI MPC",    color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200",    dot: "bg-indigo-500" },
  "india-cpi": { label: "India CPI",  color: "text-green-700",  bg: "bg-green-50 border-green-200",     dot: "bg-green-500" },
  "india-gdp": { label: "India GDP",  color: "text-purple-700", bg: "bg-purple-50 border-purple-200",   dot: "bg-purple-500" },
  fomc:      { label: "US FOMC",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  budget:    { label: "Budget",     color: "text-orange-700", bg: "bg-orange-50 border-orange-200",   dot: "bg-orange-500" },
  "us-cpi":  { label: "US CPI",     color: "text-sky-700",    bg: "bg-sky-50 border-sky-200",         dot: "bg-sky-500" },
  other:     { label: "Other",      color: "text-gray-700",   bg: "bg-gray-50 border-gray-200",       dot: "bg-gray-400" },
};

const IMPACT_CONFIG: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-green-100 text-green-700",
};

const CURRENT_DATE = new Date("2026-05-09");

function groupByMonth(evts: EconomicEvent[]): Map<number, EconomicEvent[]> {
  const map = new Map<number, EconomicEvent[]>();
  for (const e of evts) {
    const m = parseInt(e.date.slice(5, 7), 10) - 1;
    if (!map.has(m)) map.set(m, []);
    map.get(m)!.push(e);
  }
  return map;
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

const grouped = groupByMonth(events);

export default function EconomicCalendarPage() {
  const currentMonth = CURRENT_DATE.getMonth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Globe className="w-3.5 h-3.5" />
          India + Global Macro · 2026
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Economic Calendar 2026</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Key macro events that move Indian markets. RBI Monetary Policy Committee (MPC) meetings, India CPI and GDP
          releases, US Fed (FOMC) meetings, and US CPI dates for the full year 2026.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Events by month */}
      <div className="space-y-6">
        {MONTHS.map((monthName, mi) => {
          const monthEvents = grouped.get(mi) ?? [];
          if (monthEvents.length === 0) return null;
          const isPast = mi < currentMonth;
          const isCurrent = mi === currentMonth;

          return (
            <div key={monthName} className={isPast ? "opacity-60" : ""}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-base font-bold ${isCurrent ? "text-indigo-700" : "text-gray-800"}`}>
                  {monthName} 2026
                  {isCurrent && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Current month</span>}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-2">
                {monthEvents.sort((a, b) => a.date.localeCompare(b.date)).map((e, i) => {
                  const cfg = TYPE_CONFIG[e.type];
                  const eventDate = new Date(e.date + "T00:00:00");
                  const isPastEvent = eventDate < CURRENT_DATE;

                  return (
                    <div
                      key={i}
                      className={`flex gap-4 p-4 rounded-xl border ${isPastEvent ? "bg-gray-50 border-gray-200" : cfg.bg}`}
                    >
                      {/* Date */}
                      <div className="w-20 flex-shrink-0 text-center">
                        <div className={`text-xs font-medium ${isPastEvent ? "text-gray-400" : cfg.color}`}>
                          {formatEventDate(e.date)}
                        </div>
                      </div>

                      {/* Dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-0.5 ${isPastEvent ? "bg-gray-300" : cfg.dot}`} />
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-sm font-semibold ${isPastEvent ? "text-gray-500" : "text-gray-900"}`}>{e.event}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${isPastEvent ? "bg-gray-100 text-gray-400 border-gray-200" : cfg.bg + " " + cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${IMPACT_CONFIG[e.impact]}`}>
                            {e.impact.toUpperCase()} impact
                          </span>
                          {isPastEvent && (
                            <span className="text-[10px] text-gray-400">Passed</span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${isPastEvent ? "text-gray-400" : "text-gray-600"}`}>{e.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Why it matters section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900">Why These Events Matter for Indian Markets</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              icon: "IN",
              title: "RBI Monetary Policy Committee (MPC)",
              color: "bg-indigo-100 text-indigo-700",
              text: "The RBI MPC meets 6 times a year and decides the repo rate — the rate at which banks borrow from RBI. A rate cut reduces borrowing costs, boosts credit growth, lifts stock valuations (especially rate-sensitive sectors: NBFCs, real estate, banking), and weakens the rupee. A rate hike does the opposite. Nifty Bank and Nifty Financial Services move the most on MPC days. Markets often price in the expected move weeks in advance, so the language in the policy statement matters as much as the rate decision itself.",
            },
            {
              icon: "CPI",
              title: "India CPI Inflation",
              color: "bg-green-100 text-green-700",
              text: "India's Consumer Price Index (CPI) is released by MoSPI around the 12th of each month. The RBI's target is 4% ± 2% (i.e., 2%–6% band). If CPI surprises to the upside, rate cut hopes diminish — Nifty dips, bond yields rise. If it surprises to the downside, rate cut bets build — markets rally. Food and vegetable prices are the biggest variable. Watch the core CPI (ex-food, fuel) for the structural signal the RBI cares about most.",
            },
            {
              icon: "GDP",
              title: "India GDP",
              color: "bg-purple-100 text-purple-700",
              text: "India releases GDP quarterly with a ~2-month lag. Strong GDP (above ~7%) confirms the growth story and supports premium valuations. Weak GDP raises questions about corporate earnings. The advance estimate (typically January) is more market-moving than the final revision. GDP data is particularly important for FPI inflows — foreign portfolio investors monitor India's growth trajectory vs other EMs when making allocation decisions.",
            },
            {
              icon: "Fed",
              title: "US Federal Reserve (FOMC)",
              color: "bg-blue-100 text-blue-700",
              text: "The US Fed meets 8 times a year. India is a high-beta EM — when the Fed raises rates, FPIs sell Indian equities and move money to safer US treasuries. This weakens the rupee and pressures Indian stocks. When the Fed cuts, FPIs return to EMs, the rupee strengthens, and Indian markets rally. The dollar index (DXY) and US 10-year treasury yield are the key FPI flow drivers. Watch the dot plot released in March, June, September, and December for the Fed's own multi-year rate projection.",
            },
            {
              icon: "USCPI",
              title: "US CPI",
              color: "bg-sky-100 text-sky-700",
              text: "US inflation data directly drives Fed rate expectations, and Fed rate expectations drive global equity flows including India. A hot US CPI (above 3%) delays Fed cuts, strengthens the dollar, and typically triggers a risk-off selloff in Indian markets. A cool print accelerates rate cut bets, weakens the dollar, and is good for India. The correlation is not perfect — domestic factors matter — but on the day of US CPI release, Nifty often moves 0.5%–1% in response to the print.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBI Meeting schedule summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900">RBI MPC Schedule 2026 — At a Glance</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { month: "Feb 2026", date: "6 Feb", passed: true },
            { month: "Apr 2026", date: "7 Apr", passed: true },
            { month: "Jun 2026", date: "5 Jun", passed: false },
            { month: "Aug 2026", date: "7 Aug", passed: false },
            { month: "Oct 2026", date: "5 Oct", passed: false },
            { month: "Dec 2026", date: "4 Dec", passed: false },
          ].map((m) => (
            <div key={m.month} className={`rounded-lg px-3 py-2.5 border text-center ${m.passed ? "bg-gray-50 border-gray-200 opacity-60" : "bg-indigo-50 border-indigo-200"}`}>
              <div className={`text-sm font-bold ${m.passed ? "text-gray-500" : "text-indigo-700"}`}>{m.date}</div>
              <div className="text-xs text-gray-500">{m.month}</div>
              {m.passed && <div className="text-[10px] text-gray-400 mt-0.5">Passed</div>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          RBI MPC meets 6 times per year. Decision is announced on Day 3 (typically a Friday) of the 3-day deliberation.
          Current Repo Rate: check RBI website for the latest.
        </p>
      </div>

      {/* Related links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/market/fo-expiry" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">F&amp;O Expiry Calendar</div>
          <div className="text-xs text-gray-500">Monthly and weekly NSE expiry dates 2026</div>
        </Link>
        <Link href="/earnings-calendar" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Earnings Calendar</div>
          <div className="text-xs text-gray-500">Quarterly results dates for Indian companies</div>
        </Link>
        <Link href="/market/holidays" className="card hover:border-indigo-300 transition">
          <div className="text-sm font-semibold text-gray-900 mb-1">Market Holidays 2026</div>
          <div className="text-xs text-gray-500">NSE/BSE trading holiday dates</div>
        </Link>
      </div>
    </div>
  );
}
