// Source: _shared/templates/components/OnboardingTour.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/OnboardingTour.tsx
// Lightweight first-run product tour. No external dep — uses a portal,
// element bounding rect, and a backdrop with a cut-out.
//
// Copy to: src/components/shared/OnboardingTour.tsx
//
// Deps: react, lucide-react (for X icon)
//
// Behavior:
// - Reads localStorage key (default "talkytools.tour.completed.v1").
// - If unset, auto-runs the tour on mount.
// - User can Skip or step Next/Back.
// - On completion (or skip), writes "true" to localStorage so it never reruns.

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export interface TourStep {
  /** CSS selector for the element to highlight. */
  target: string;
  /** Step title shown in the tooltip. */
  title: string;
  /** Step body — short instructive text. */
  body: string;
}

export interface OnboardingTourProps {
  steps: TourStep[];
  /** localStorage key to remember completion. */
  storageKey?: string;
  /** Force-run even if previously completed. Useful for "Replay tour" UX. */
  forceRun?: boolean;
  /** Called when the tour is finished or skipped. */
  onComplete?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_KEY = "talkytools.tour.completed.v1";
const PADDING = 8;

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * OnboardingTour — first-run guided tour.
 *
 * @example
 *   <OnboardingTour
 *     steps={[
 *       { target: "#sidebar-nav", title: "Navigate", body: "All your tools live here." },
 *       { target: "#create-btn", title: "Create", body: "Start a new project anytime." },
 *     ]}
 *   />
 */
export function OnboardingTour({
  steps,
  storageKey = DEFAULT_KEY,
  forceRun = false,
  onComplete,
}: OnboardingTourProps) {
  const [active, setActive] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(storageKey) === "true";
    if (forceRun || !done) setActive(true);
  }, [storageKey, forceRun]);

  const currentStep = steps[stepIndex];

  // Re-measure the highlighted element on step change + on resize/scroll.
  React.useEffect(() => {
    if (!active || !currentStep) return;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(currentStep.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, currentStep]);

  const finish = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }
    setActive(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const next = () => {
    if (stepIndex >= steps.length - 1) finish();
    else setStepIndex((i) => i + 1);
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  if (!mounted || !active || !currentStep) return null;

  const tooltipStyle: React.CSSProperties = rect
    ? {
        top: Math.min(
          window.innerHeight - 180,
          rect.top + rect.height + PADDING + 8,
        ),
        left: Math.max(
          12,
          Math.min(
            window.innerWidth - 332,
            rect.left + rect.width / 2 - 160,
          ),
        ),
      }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-[9999]"
    >
      {/* Backdrop with optional cut-out around the target. */}
      {rect ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - PADDING}
                y={rect.top - PADDING}
                width={rect.width + PADDING * 2}
                height={rect.height + PADDING * 2}
                rx={8}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.55)"
            mask="url(#tour-mask)"
          />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-slate-900/55" />
      )}

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="absolute w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <button
          type="button"
          onClick={finish}
          aria-label="Skip tour"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Step {stepIndex + 1} of {steps.length}
        </div>
        <h3
          id="onboarding-tour-title"
          className="mt-1 text-base font-semibold text-slate-900"
        >
          {currentStep.title}
        </h3>
        <p className="mt-1 text-sm text-slate-600">{currentStep.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              disabled={stepIndex === 0}
              className={cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                stepIndex === 0
                  ? "cursor-not-allowed text-slate-300"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {stepIndex === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default OnboardingTour;
