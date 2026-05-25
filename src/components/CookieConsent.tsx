// _shared/templates/components/CookieConsent.tsx
//
// Cookie consent banner — DPDP (India) + GDPR (EU) compliant.
// Drop into src/components/, import once in app/layout.tsx.
//
// What it does (real, not theater):
//   1. Essential cookies (auth/session) ALWAYS allowed. The app cannot work without them.
//   2. Non-essential cookies (analytics, marketing) gated behind explicit consent.
//      Other code reads `hasConsent("analytics")` before firing window.gtag / Plausible /
//      Sentry session replay / Meta pixel / etc.
//   3. Granular toggle per category — user picks what to allow.
//   4. Withdraw anytime — call `openConsentSettings()` from a footer link.
//   5. Records: version, timestamp, categories, IP-less. Stored locally; backend audit is optional.
//
// Wiring example (any component that wants analytics):
//   import { hasConsent } from "@/components/CookieConsent"
//   useEffect(() => {
//     if (hasConsent("analytics")) {
//       window.plausible?.("pageview")
//     }
//   }, [])

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const STORAGE_KEY = "tt-cookie-consent-v2"
const POLICY_VERSION = "2026-05-25"

// Categories — keep in sync with the privacy policy
type Category = "essential" | "analytics" | "marketing"

type ConsentState = {
  version: string
  ts: number
  categories: Record<Category, boolean>
}

const DEFAULT_STATE: ConsentState = {
  version: POLICY_VERSION,
  ts: 0,
  categories: { essential: true, analytics: false, marketing: false }, // essential always on
}

// ── Public API ─────────────────────────────────────────────────────────────
// Other components import these to gate their own cookie-setting code.

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    // Force re-consent if policy version changed
    if (parsed.version !== POLICY_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function hasConsent(category: Category): boolean {
  if (category === "essential") return true
  const c = getConsent()
  return !!c?.categories[category]
}

// Components elsewhere can dispatch `window.dispatchEvent(new Event("open-cookie-settings"))`
// to re-open the banner (e.g., from a footer "Cookie settings" link).
export function openConsentSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-cookie-settings"))
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [categories, setCategories] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    if (typeof window === "undefined") return
    const existing = getConsent()
    if (!existing) {
      setShow(true)
    }
    const openHandler = () => {
      const cur = getConsent()
      if (cur) {
        setCategories({ analytics: cur.categories.analytics, marketing: cur.categories.marketing })
      }
      setShow(true)
      setExpanded(true)
    }
    window.addEventListener("open-cookie-settings", openHandler)
    return () => window.removeEventListener("open-cookie-settings", openHandler)
  }, [])

  const save = (allAccept: boolean | null = null) => {
    const cats = allAccept === true
      ? { essential: true, analytics: true, marketing: true }
      : allAccept === false
      ? { essential: true, analytics: false, marketing: false }
      : { essential: true, analytics: categories.analytics, marketing: categories.marketing }
    const state: ConsentState = { version: POLICY_VERSION, ts: Date.now(), categories: cats }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setShow(false)
    // Fire a custom event so the rest of the app can react (e.g., load gtag if just opted in)
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: state }))
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-[100] bg-white border border-slate-200 rounded-xl shadow-2xl p-4"
    >
      <div className="text-sm text-slate-800 mb-3">
        <strong className="block mb-1 text-slate-900">We use cookies.</strong>
        <span className="text-slate-600">
          Essential cookies keep you logged in. We&apos;d also like to enable analytics to improve
          IPOpulse. You decide.{" "}
          <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </span>
      </div>

      {expanded && (
        <div className="text-xs text-slate-700 mb-3 space-y-2 border-t border-slate-100 pt-3">
          <label className="flex items-center justify-between cursor-not-allowed opacity-70">
            <span>
              <strong>Essential</strong>
              <span className="block text-slate-500">Login, security, page navigation — always on.</span>
            </span>
            <input type="checkbox" checked disabled className="ml-2" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>
              <strong>Analytics</strong>
              <span className="block text-slate-500">Anonymous usage stats to improve features.</span>
            </span>
            <input
              type="checkbox"
              checked={categories.analytics}
              onChange={(e) => setCategories((c) => ({ ...c, analytics: e.target.checked }))}
              className="ml-2"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>
              <strong>Marketing</strong>
              <span className="block text-slate-500">Conversion + retargeting (off by default).</span>
            </span>
            <input
              type="checkbox"
              checked={categories.marketing}
              onChange={(e) => setCategories((c) => ({ ...c, marketing: e.target.checked }))}
              className="ml-2"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded border border-slate-200"
          >
            Customize
          </button>
        )}
        <button
          onClick={() => save(false)}
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 rounded border border-slate-200"
        >
          Reject non-essential
        </button>
        {expanded ? (
          <button
            onClick={() => save(null)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save preferences
          </button>
        ) : (
          <button
            onClick={() => save(true)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Accept all
          </button>
        )}
      </div>
    </div>
  )
}

export default CookieConsent
