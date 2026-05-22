"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface PremiumGateProps {
  /** The premium-only content to render when the user has PREMIUM plan */
  children: React.ReactNode;
  /** Whether the current user has a PREMIUM plan. Pass from server component / page. */
  isPremium: boolean;
  /** Optional label shown on the upgrade button. Defaults to "Upgrade to Premium". */
  ctaLabel?: string;
  /** Optional brief description shown below the lock icon. */
  description?: string;
}

/**
 * Wraps premium-only UI. Shows children when `isPremium` is true, otherwise
 * shows a lock icon + "Upgrade to Premium" CTA linking to /pricing.
 *
 * Usage:
 *   <PremiumGate isPremium={session?.user?.plan === "PREMIUM"}>
 *     <MyPremiumWidget />
 *   </PremiumGate>
 */
export function PremiumGate({
  children,
  isPremium,
  ctaLabel = "Upgrade to Premium",
  description = "This feature is available on Premium.",
}: PremiumGateProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{description}&nbsp;</span>
      <Link
        href="/pricing"
        className="text-indigo-600 font-semibold hover:text-indigo-800 underline underline-offset-2 whitespace-nowrap"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
