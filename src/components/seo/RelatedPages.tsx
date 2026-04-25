import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedItem {
  href: string;
  title: string;
  desc?: string;
}

export function RelatedPages({ title = "Related on IPOpulse", items }: { title?: string; items: RelatedItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="card hover:border-indigo-300 transition group">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{i.title}</div>
            {i.desc ? <p className="text-xs text-gray-500 mt-1 line-clamp-2">{i.desc}</p> : null}
            <div className="mt-2 text-xs text-indigo-600 inline-flex items-center gap-0.5">
              Open <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
