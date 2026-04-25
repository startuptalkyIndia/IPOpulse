import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  if (trail.length === 0) return null;

  const itemList = trail.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.label,
    item: c.href ? `https://ipopulse.talkytools.com${c.href}` : undefined,
  }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itemList,
  };

  return (
    <>
      <nav className="text-xs text-gray-500 mb-2 flex flex-wrap items-center gap-1">
        {trail.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {c.href ? (
              <Link href={c.href} className="hover:text-indigo-600">{c.label}</Link>
            ) : (
              <span className="text-gray-700">{c.label}</span>
            )}
            {i < trail.length - 1 ? <ChevronRight className="w-3 h-3 text-gray-400" /> : null}
          </span>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
