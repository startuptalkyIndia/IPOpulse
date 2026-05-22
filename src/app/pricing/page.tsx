import { Metadata } from "next";
import Link from "next/link";
import { Check, Lock, Bell, Download, Filter, Star } from "lucide-react";
import { WhatsAppBanner } from "@/components/WhatsAppBanner";

export const metadata: Metadata = {
  title: "Pricing — IPOpulse",
  description:
    "Free access to all IPO data. Upgrade to Premium for GMP alerts, Excel exports, advanced filters, and more.",
};

const freeFeatures = [
  "All IPO listings (upcoming, live, closed, listed)",
  "Live GMP table",
  "Subscription & allotment status",
  "Basic company info and DRHP",
  "All calculators (SIP, EMI, Capital Gains, etc.)",
  "FII/DII activity tracker",
  "Super Investor holdings",
  "Market data & screeners",
];

const premiumFeatures = [
  { icon: Bell, text: "GMP alerts — notify me when GMP changes by X%" },
  { icon: Bell, text: "Subscription open / close alerts" },
  { icon: Bell, text: "Allotment result alerts" },
  { icon: Download, text: "Excel (.xlsx) export for any data table" },
  { icon: Filter, text: "Advanced filters — filter by GMP%, subscription multiple, lot size, issue size" },
  { icon: Star, text: "Watchlist — save and track IPOs" },
  { icon: Check, text: "Everything in the Free tier" },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            All IPO data is free. Upgrade to Premium for real-time alerts, exports, and advanced tools.
          </p>
        </div>

        {/* WhatsApp Channel CTA */}
        <div className="mb-10">
          <WhatsAppBanner />
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FREE plan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col">
            <div className="mb-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
                Free
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-400 text-sm">/ forever</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                No account needed for most data. Create a free account to unlock watchlist and application tracking.
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full text-center px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* PREMIUM plan */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-lg p-8 flex flex-col relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              Most Popular
            </div>

            <div className="mb-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full mb-3">
                Premium
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">₹199</span>
                <span className="text-gray-400 text-sm">/ month</span>
              </div>
              <div className="mt-1 text-sm text-indigo-600 font-medium">
                or ₹1,499 / year{" "}
                <span className="text-xs text-gray-500 font-normal">(save ₹900)</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                For active IPO investors who want real-time signals and data exports.
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {premiumFeatures.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Icon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm opacity-60 cursor-not-allowed"
              title="Coming soon"
            >
              Coming soon
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Powered by Razorpay
            </p>
          </div>
        </div>

        {/* FAQ / reassurance row */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          {[
            { title: "No credit card needed", desc: "Free tier is always free. No expiry." },
            { title: "Cancel anytime", desc: "Premium billing is monthly — cancel with one click." },
            { title: "Data stays free", desc: "All IPO listings, GMP, and allotment data will never go behind a paywall." },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <p className="text-sm font-semibold text-gray-800 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
