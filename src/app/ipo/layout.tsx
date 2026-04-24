import Link from "next/link";
import type { ReactNode } from "react";

const tabs = [
  { href: "/ipo", label: "Overview" },
  { href: "/ipo/live", label: "Open" },
  { href: "/ipo/upcoming", label: "Upcoming" },
  { href: "/ipo/closed", label: "Closed" },
  { href: "/ipo/listed", label: "Listed" },
  { href: "/ipo/sme", label: "SME IPOs" },
  { href: "/ipo/calendar", label: "Calendar" },
  { href: "/ipo/allotment", label: "Allotment" },
];

export default function IpoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto pt-5 pb-0 border-b border-gray-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="text-sm px-3 py-2.5 text-gray-600 hover:text-indigo-600 whitespace-nowrap border-b-2 border-transparent hover:border-indigo-300 -mb-px"
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="py-6">{children}</div>
    </div>
  );
}
