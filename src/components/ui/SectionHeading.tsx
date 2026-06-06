import type { ReactNode } from "react";

/**
 * Consistent section heading with an optional accent bar, icon, and right slot.
 * Replaces the ad-hoc h2 styling scattered across pages.
 */

interface Props {
  title: string;
  icon?: ReactNode;
  /** Tailwind bg-color class for the accent bar (e.g. "bg-indigo-500") */
  accent?: string;
  right?: ReactNode;
  sub?: string;
}

export function SectionHeading({ title, icon, accent = "bg-indigo-500", right, sub }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2.5">
        {accent && !icon && <span className={`w-1 h-5 rounded-full ${accent}`} />}
        {icon && <span className="text-indigo-600">{icon}</span>}
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
