// Source: _shared/templates/components/SkeletonLoader.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/SkeletonLoader.tsx
// Generic skeleton loader for first-paint placeholders across TalkyTools projects.
// Indigo theme, Tailwind animate-pulse.
//
// Copy to: src/components/shared/SkeletonLoader.tsx
//
// Deps: react, clsx (optional — falls back to plain string join)

"use client";

import * as React from "react";

export interface SkeletonLoaderProps {
  /** Number of skeleton lines to render (default: 3). */
  lines?: number;
  /** Tailwind height utility per line (default: "h-4"). */
  height?: string;
  /** Extra wrapper classes. */
  className?: string;
  /** Optional inline width pattern. The last line is naturally narrower
   *  to mimic real prose. Override here if you want fixed-width skeletons. */
  widths?: string[];
  /** Accessible label for screen readers (default: "Loading content"). */
  ariaLabel?: string;
}

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * SkeletonLoader — generic shimmer placeholder.
 *
 * @example
 *   <SkeletonLoader lines={4} height="h-5" />
 *
 * @example  Card placeholder
 *   <div className="rounded-2xl border border-slate-200 bg-white p-6">
 *     <SkeletonLoader lines={2} height="h-4" widths={["w-1/3", "w-2/3"]} />
 *   </div>
 */
export function SkeletonLoader({
  lines = 3,
  height = "h-4",
  className,
  widths,
  ariaLabel = "Loading content",
}: SkeletonLoaderProps) {
  const lineWidths =
    widths ??
    Array.from({ length: lines }, (_, i) =>
      i === lines - 1 ? "w-3/5" : "w-full",
    );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cx("space-y-2", className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cx(
            "animate-pulse rounded-md bg-slate-200/80",
            height,
            lineWidths[i] ?? "w-full",
          )}
        />
      ))}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

/**
 * SkeletonAvatar — circular placeholder for profile photos / icons.
 */
export function SkeletonAvatar({
  size = "h-10 w-10",
  className,
}: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading avatar"
      className={cx(
        "animate-pulse rounded-full bg-slate-200/80",
        size,
        className,
      )}
    />
  );
}

/**
 * SkeletonCard — preset for typical card placeholders.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1">
          <SkeletonLoader lines={2} height="h-3" widths={["w-1/3", "w-1/2"]} />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonLoader lines={3} />
      </div>
    </div>
  );
}

export default SkeletonLoader;
