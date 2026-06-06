import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket, LineChart, Activity, PiggyBank, Calculator, Newspaper, GraduationCap,
  Compass, ArrowRight,
} from "lucide-react";
import { SITE_MAP } from "@/lib/site-map";

export const metadata: Metadata = {
  title: "Explore IPOpulse — All Tools, Data & Pages in One Place",
  description:
    "The complete index of everything on IPOpulse — IPO tracking, stock research, screener, market data, mutual funds, calculators, news and learning guides. Find any tool fast.",
  alternates: { canonical: "/explore" },
};

const ICONS: Record<string, React.ElementType> = {
  Rocket, LineChart, Activity, PiggyBank, Calculator, Newspaper, GraduationCap,
};

const SECTION_COLORS: Record<string, string> = {
  ipo: "text-rose-600 bg-rose-50",
  stocks: "text-indigo-600 bg-indigo-50",
  markets: "text-violet-600 bg-violet-50",
  funds: "text-emerald-600 bg-emerald-50",
  tools: "text-amber-600 bg-amber-50",
  research: "text-blue-600 bg-blue-50",
  learn: "text-teal-600 bg-teal-50",
};

export default function ExplorePage() {
  const totalLinks = SITE_MAP.reduce((s, sec) => s + sec.groups.reduce((g, grp) => g + grp.links.length, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
          <Compass className="w-3.5 h-3.5" /> {totalLinks}+ tools & pages
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore everything on IPOpulse</h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          The complete index of every tool, dataset and page — organized by what you want to do.
          Whether you&apos;re tracking IPOs, researching stocks, scanning market data, or learning the basics,
          it&apos;s all here.
        </p>
      </div>

      {/* Quick jump pills */}
      <div className="flex flex-wrap gap-2">
        {SITE_MAP.map((section) => {
          const Icon = ICONS[section.icon] ?? Compass;
          return (
            <a
              key={section.key}
              href={`#${section.key}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
            >
              <Icon className="w-3.5 h-3.5" /> {section.label}
            </a>
          );
        })}
      </div>

      {/* Sections */}
      {SITE_MAP.map((section) => {
        const Icon = ICONS[section.icon] ?? Compass;
        const color = SECTION_COLORS[section.key] ?? "text-indigo-600 bg-indigo-50";
        return (
          <section key={section.key} id={section.key} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section.href ? (
                    <Link href={section.href} className="hover:text-indigo-700">{section.label}</Link>
                  ) : section.label}
                </h2>
                <p className="text-xs text-gray-500">{section.blurb}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.groups.map((grp) => (
                <div key={grp.title} className="card">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{grp.title}</h3>
                  <div className="space-y-0.5">
                    {grp.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block group rounded-lg px-2 py-1.5 -mx-2 hover:bg-indigo-50 transition"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{link.label}</span>
                          {link.badge && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">{link.badge}</span>
                          )}
                          <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        {link.desc && <div className="text-[11px] text-gray-500 leading-snug">{link.desc}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Footer note */}
      <div className="card bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          Can&apos;t find something? Use the search (press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">/</kbd>) or
          start from the <Link href="/" className="text-indigo-600 hover:underline">homepage</Link>.
        </p>
      </div>
    </div>
  );
}
