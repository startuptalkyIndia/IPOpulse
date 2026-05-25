// Source: _shared/templates/components/EmptyState.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/EmptyState.tsx
// Standard empty state for "no data" screens across TalkyTools projects.
// Always provides context, a clear CTA, and optional help link.
//
// Copy to: src/components/shared/EmptyState.tsx
//
// Deps: react, lucide-react

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  /** Click handler. Either onClick or href must be set. */
  onClick?: () => void;
  /** Optional URL. When set, renders as <a>. */
  href?: string;
}

export interface EmptyStateProps {
  /** Lucide icon component, e.g. `Inbox`, `Search`, `FileText`. */
  icon?: LucideIcon;
  /** Headline e.g. "No conversations yet". */
  title: string;
  /** Plain-English explanation of why empty + what user can do. */
  description?: string;
  /** Primary CTA. */
  action?: EmptyStateAction;
  /** Optional secondary help link. */
  helpLink?: { label: string; href: string };
  /** Optional product/section context label shown above the icon. */
  context?: string;
  /** Extra wrapper classes. */
  className?: string;
}

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * EmptyState — empty-data placeholder with CTA.
 *
 * @example
 *   import { Inbox } from "lucide-react";
 *   <EmptyState
 *     icon={Inbox}
 *     title="No conversations yet"
 *     description="When customers DM you, they'll show up here."
 *     action={{ label: "Connect Instagram", href: "/settings" }}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  helpLink,
  context,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cx(
        "mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center",
        className,
      )}
    >
      {context ? (
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {context}
        </div>
      ) : null}
      {Icon ? (
        <div
          aria-hidden="true"
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
        >
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              {action.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              {action.label}
            </button>
          )}
        </div>
      ) : null}
      {helpLink ? (
        <a
          href={helpLink.href}
          className="mt-3 text-sm text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline"
        >
          {helpLink.label}
        </a>
      ) : null}
    </div>
  );
}

export default EmptyState;
