"use client";

/**
 * IpoHubOnboarding — first-time user checklist shown at the top of the IPO hub.
 * Steps are static (no auth needed); completion is tracked in localStorage only.
 * Dismiss is permanent per device.
 */
import { OnboardingChecklist } from "@/components/shared/OnboardingChecklist";

export function IpoHubOnboarding() {
  return (
    <OnboardingChecklist
      storageKey="ipopulse.ipoHubOnboarding.dismissed"
      title="Get the most out of IPOpulse"
      steps={[
        {
          key: "browse",
          label: "Browse open and upcoming IPOs",
          description: "See live subscription status, GMP, lot size, and price band for every active IPO.",
          href: "/ipo/live",
        },
        {
          key: "watchlist",
          label: "Save IPOs to your watchlist",
          description: "Create a free account to track allotment dates, GMP alerts, and listing performance.",
          href: "/my/watchlist",
        },
        {
          key: "allotment",
          label: "Check your allotment status",
          description: "After the IPO closes, check directly from your applications page — no registrar hunting.",
          href: "/my/applications",
        },
      ]}
    />
  );
}
