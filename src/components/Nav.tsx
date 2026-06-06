import Link from "next/link";
import { TrendingUp, User as UserIcon, ChevronDown, Compass } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SearchPalette } from "./SearchPalette";
import { MobileNav } from "./MobileNav";
import { SITE_MAP } from "@/lib/site-map";

export async function Nav() {
  const session = await auth();
  const authed = !!session?.user;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-lg">
            IPO<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">pulse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {SITE_MAP.map((section, si) => {
            // Keep last few dropdowns right-aligned so they don't overflow viewport
            const alignRight = si >= SITE_MAP.length - 3;
            return (
              <div key={section.key} className="group relative">
                {/* Trigger */}
                <div className="flex items-center gap-0.5 px-2.5 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors select-none">
                  {section.href ? (
                    <Link href={section.href} className="font-medium">{section.label}</Link>
                  ) : (
                    <span className="font-medium">{section.label}</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-150 group-hover:rotate-180" />
                </div>

                {/* Dropdown panel */}
                <div className="absolute top-full pt-1 hidden group-hover:block z-50"
                  style={{ left: alignRight ? "auto" : 0, right: alignRight ? 0 : "auto" }}>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-4">
                    <div className={`flex gap-6 ${section.groups.length === 1 ? "min-w-[230px]" : section.groups.length === 2 ? "min-w-[440px]" : "min-w-[640px]"}`}>
                      {section.groups.map((grp, ci) => (
                        <div key={ci} className="space-y-0.5 flex-1 min-w-[200px]">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-1">{grp.title}</div>
                          {grp.links.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              {item.label}
                              {item.badge && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold ml-auto">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Footer link to explore all */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link href="/explore" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2">
                        <Compass className="w-3.5 h-3.5" /> Explore all {section.label} tools →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <MobileNav authed={authed} />
          <SearchPalette />
          <ThemeToggle />
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition"
          >
            Pricing
          </Link>
          {authed ? (
            <Link
              href="/my/watchlist"
              className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-full hover:bg-indigo-100"
            >
              <UserIcon className="w-3.5 h-3.5" /> My
            </Link>
          ) : (
            <>
              <Link href="/signin" className="hidden sm:inline-block text-sm text-gray-500 hover:text-gray-900">
                Sign in
              </Link>
              <Link href="/signup" className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
