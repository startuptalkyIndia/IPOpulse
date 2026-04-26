// Standard empty state — solves the "no data" generic UX issue across TalkyTools.
// Always shows: product/section context, why empty, primary CTA, secondary help link.

import Link from "next/link";

interface EmptyStateProps {
  /** Product or section name shown at top, e.g. "IPOpulse · My Watchlist" */
  context: string;
  /** Big icon/emoji */
  icon?: string;
  /** Headline e.g. "No watchlisted IPOs yet" */
  title: string;
  /** Plain English explanation of why empty */
  reason: string;
  /** Primary CTA */
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional secondary link (e.g. "View setup guide") */
  helpLink?: { label: string; href: string };
}

export function EmptyState({ context, icon = "📭", title, reason, action, helpLink }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md text-center py-12 px-6">
      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
        {context}
      </div>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{reason}</p>
      <div className="flex flex-col items-center gap-3">
        {action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {action.label} →
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {action.label} →
          </button>
        )}
        {helpLink && (
          <Link href={helpLink.href} className="text-sm text-gray-500 hover:text-indigo-600">
            {helpLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
