"use client";

/**
 * OnboardingChecklist — dismissible 3-step starter card for first-time users.
 *
 * Adjacent to whatever else lives on the dashboard. Persists dismiss in
 * localStorage (no DB write needed for v1). Hidden on mobile (<768px) so the
 * dashboard isn't pushed below the fold — mobile users see a simpler nudge.
 *
 * Per-product step content is passed in by the parent — this component is
 * intentionally dumb. See `src/app/(dashboard)/dashboard/page.tsx` for the
 * PayDesk wiring.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from "lucide-react";

export interface OnboardingStep {
  /** Stable key — also drives the "done" flag in localStorage if used. */
  key: string;
  /** Short label, e.g. "Complete your profile". */
  label: string;
  /** Sub-copy explaining what they'll do. */
  description: string;
  /** Destination URL. */
  href: string;
  /** Optional pre-checked flag — pass true if you already know it's done. */
  done?: boolean;
}

export interface OnboardingChecklistProps {
  /** Up to 3 steps. More will still render but the card is designed for 3. */
  steps: OnboardingStep[];
  /** Card heading. Defaults to "Get started". */
  title?: string;
  /** Sub-heading copy. */
  subtitle?: string;
  /** localStorage key for dismiss state. MUST be unique per product. */
  storageKey: string;
}

export function OnboardingChecklist({
  steps,
  title = "Get started",
  subtitle,
  storageKey,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  // Render nothing until we know the dismiss state — avoids a flash of the
  // card for users who've already dismissed it.
  if (dismissed === null || dismissed) return null;

  const completed = steps.filter((s) => s.done).length;
  const percent = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "1");
    }
    setDismissed(true);
  };

  return (
    <div className="hidden md:block bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {subtitle ?? `${completed} of ${steps.length} done · ${percent}% complete`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Dismiss onboarding"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5">
        <div className="h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <ul className="p-3 space-y-1">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className="block group"
              aria-label={`${step.label}: ${step.description}`}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/70 transition-colors">
                <div className="flex-shrink-0">
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      step.done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-500">{step.description}</p>
                </div>
                {!step.done && (
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OnboardingChecklist;
