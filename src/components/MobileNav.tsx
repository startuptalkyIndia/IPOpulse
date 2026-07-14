"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, TrendingUp, ChevronRight } from "lucide-react";
import { SITE_MAP } from "@/lib/site-map";

// Mobile drawer sections — derived from the canonical site map (single source of truth).
// Flatten each top-level section's sub-groups into one link list per section.
const sections = SITE_MAP.map((s) => ({
  title: s.label,
  links: [
    ...(s.href ? [{ href: s.href, label: `All ${s.label}` }] : []),
    ...s.groups.flatMap((g) => g.links.map((l) => ({ href: l.href, label: l.label }))),
  ],
}));

export function MobileNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-200 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-gray-900">
              IPO<span className="text-indigo-600">pulse</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-[calc(100%-56px-56px)]">
          <Link
            href="/explore"
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-b border-indigo-100"
          >
            🧭 Explore all tools
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
          {sections.map((section) => (
            <div key={section.title} className="border-b border-gray-100">
              <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                {section.title}
              </div>
              <nav className="py-1">
                {section.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      pathname === l.href
                        ? "text-indigo-700 bg-indigo-50 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {l.label}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Auth footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex gap-2">
          {authed ? (
            <Link
              href="/my/watchlist"
              className="flex-1 text-center text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg"
            >
              My Watchlist
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="flex-1 text-center text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm font-medium bg-indigo-600 text-white px-3 py-2 rounded-lg"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
