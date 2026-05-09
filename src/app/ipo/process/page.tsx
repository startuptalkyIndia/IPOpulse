import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Users, Clock, TrendingUp, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete IPO Process in India — From DRHP to Listing | Step-by-Step",
  description:
    "The complete step-by-step IPO process in India — from company decision to DRHP filing, SEBI approval, roadshow, bidding, allotment, refund, and listing. Everything retail investors need to know.",
  alternates: { canonical: "/ipo/process" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How an IPO Works in India",
  description: "Step-by-step process of an Initial Public Offering (IPO) in India from DRHP filing to stock listing",
  step: [
    { "@type": "HowToStep", name: "Company decides to go public", text: "Board resolution, appointment of investment banks, legal advisors" },
    { "@type": "HowToStep", name: "DRHP filing with SEBI", text: "Draft Red Herring Prospectus filed with SEBI and exchanges" },
    { "@type": "HowToStep", name: "SEBI review and approval", text: "SEBI reviews the DRHP (typically 30–75 days)" },
    { "@type": "HowToStep", name: "Anchor investor allocation", text: "QIBs allocated shares 1 day before IPO opens" },
    { "@type": "HowToStep", name: "IPO subscription window", text: "3 days open for retail, HNI, and QIB bids" },
    { "@type": "HowToStep", name: "Basis of allotment and refund", text: "Shares allotted and unallotted money unblocked" },
    { "@type": "HowToStep", name: "Listing on NSE/BSE", text: "Shares list and begin trading approximately 6 days after IPO closes" },
  ],
};

interface StepProps {
  number: number;
  title: string;
  duration: string;
  description: string;
  details: string[];
  icon: React.ElementType;
  color: string;
}

const steps: StepProps[] = [
  {
    number: 1,
    title: "Company Decides to Go Public",
    duration: "Months before",
    icon: Users,
    color: "bg-violet-50 text-violet-600",
    description:
      "The company's board passes a resolution to raise capital through a public offering. Key decisions made at this stage:",
    details: [
      "Appoint SEBI-registered investment banks (Book Running Lead Managers / BRLMs) — e.g., Kotak, Axis, ICICI, JM Financial",
      "Hire legal counsels, registrar (KFintech or Linkintime), and auditors",
      "Decide IPO size: fresh issue (new shares, money goes to company) vs OFS (existing shareholders sell, money goes to sellers)",
      "Choose IPO type: Fixed Price or Book Building (99% of modern IPOs use book building)",
      "Conduct internal financial audits and compliance review",
    ],
  },
  {
    number: 2,
    title: "DRHP Filing with SEBI",
    duration: "D-60 to D-90 before listing",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
    description:
      "The Draft Red Herring Prospectus (DRHP) is filed simultaneously with SEBI, NSE, and BSE. It is publicly available immediately.",
    details: [
      "DRHP contains: business description, financial statements (3 years audited), risk factors, use of proceeds, management profiles",
      "Promoter background and shareholding pattern disclosed",
      "Litigation and regulatory history must be fully disclosed",
      "Price band NOT disclosed in DRHP — only revealed later in the final RHP",
      "Anyone can download the DRHP from SEBI website (sebi.gov.in) or BSE/NSE",
      "IPOpulse tracks all filed DRHPs at /ipo/drhp",
    ],
  },
  {
    number: 3,
    title: "SEBI Review",
    duration: "30–75 days",
    icon: CheckCircle2,
    color: "bg-amber-50 text-amber-600",
    description:
      "SEBI reviews the DRHP and may raise observations (queries). The company must respond to all SEBI observations before proceeding.",
    details: [
      "SEBI typically takes 30 days for its first set of observations",
      "Company and bankers respond to queries — SEBI may have multiple rounds",
      "SEBI issues an 'observation letter' — this is NOT an approval of the IPO quality, only compliance verification",
      "SEBI's observation letter is valid for 12 months — IPO must open within this window",
      "Stock exchanges also review and provide their in-principle approval",
    ],
  },
  {
    number: 4,
    title: "Pre-IPO Placement & Roadshow",
    duration: "2–4 weeks before IPO",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    description:
      "The company may do a pre-IPO placement with institutional investors and conducts a roadshow to generate demand.",
    details: [
      "Pre-IPO placement: Up to 20% of the IPO size can be placed with institutional investors before the public offer",
      "Roadshow: Company management meets major institutional investors (mutual funds, FPIs, insurance companies) across cities",
      "Price band finalised and disclosed — typically 5–10 days before IPO opens",
      "Red Herring Prospectus (RHP) — the final prospectus with price band — is filed and published",
      "Anchor investor applications received 1 day before IPO opens",
    ],
  },
  {
    number: 5,
    title: "Anchor Investor Allocation",
    duration: "1 day before IPO opens",
    icon: Users,
    color: "bg-indigo-50 text-indigo-600",
    description:
      "Qualified Institutional Buyers (QIBs) who are selected as anchor investors receive their allotment at the upper end of the price band.",
    details: [
      "50% of QIB portion (= 25% of net issue) allocated to anchors",
      "Anchors are disclosed publicly on BSE/NSE — you can see which funds invested",
      "Anchor lock-in: 30 days post listing for entire anchor allocation (revised from earlier 2-phase 30/90 day rule)",
      "Strong anchor list (reputed MFs, top FPIs) signals institutional conviction",
    ],
  },
  {
    number: 6,
    title: "IPO Subscription Window",
    duration: "3 days (mandatory for mainboard)",
    icon: Clock,
    color: "bg-rose-50 text-rose-600",
    description:
      "The IPO is open for bidding for exactly 3 days (Monday–Wednesday or Tuesday–Thursday). Investors apply via ASBA or UPI.",
    details: [
      "Bidding hours: 10:00 AM to 5:00 PM on all 3 days",
      "ASBA: Bank blocks your bid amount — no fund transfer until allotment",
      "UPI: Bid via broker app, UPI mandate sent to your UPI app for approval (must approve within 30 minutes)",
      "Minimum bid = 1 lot (company-specific, typically 14–200 shares, designed to keep application below ₹15,000–₹15,000)",
      "Retail investors: maximum ₹2 lakh per application",
      "Can modify or withdraw bids until the last day 5:00 PM",
      "Subscription data published 3× daily on BSE/NSE and aggregated on IPOpulse",
    ],
  },
  {
    number: 7,
    title: "Basis of Allotment",
    duration: "Day 4–5 after IPO closes",
    icon: CheckCircle2,
    color: "bg-teal-50 text-teal-600",
    description:
      "The Registrar processes all bids and conducts a lottery (for retail) or proportional allotment (for HNI/QIB) to determine who gets shares.",
    details: [
      "Retail: Lottery if oversubscribed — maximum 1 lot per applicant. If 5× oversubscribed, 1 in 5 applicants get 1 lot",
      "HNI: Proportional — if 100× oversubscribed and you bid 100 lots, you get 1 lot",
      "QIB: Proportional to bids. No refund for QIBs — their entire bid amount is assumed committed",
      "Allotment status available on registrar website (KFintech, Linkintime) and BSE/NSE by end of allotment day",
      "Check allotment using PAN number on IPOpulse at /ipo/allotment",
    ],
  },
  {
    number: 8,
    title: "Refund of Unallotted Funds",
    duration: "Day 5–6 after IPO closes",
    icon: ArrowRight,
    color: "bg-gray-50 text-gray-600",
    description:
      "Unallotted application amounts are unblocked in your bank account. Allotted shares are credited to your demat account.",
    details: [
      "For ASBA: Bank unblocks amount automatically — no action needed",
      "For UPI: UPI mandate cancelled for unallotted applications",
      "Allotted shares credited to demat account (CDSL/NSDL) on or before listing date",
      "SEBI mandates allotment and refund within 6 working days of IPO closure",
      "Typical timeline: IPO closes Thursday → Allotment Saturday/Monday → Listing Tuesday/Wednesday",
    ],
  },
  {
    number: 9,
    title: "Listing on NSE/BSE",
    duration: "Day 6 after IPO closes (T+6)",
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-700",
    description:
      "Shares begin trading on NSE and BSE. The listing price is determined by pre-open price discovery from 9:00–9:15 AM on listing day.",
    details: [
      "Pre-open session 9:00–9:15 AM discovers the listing price based on demand/supply at various prices",
      "Normal trading begins at 9:15 AM — shares can be bought/sold freely",
      "Upper circuit on Day 1: no upper limit for the first day of listing (SEBI rule — any price can be discovered)",
      "Lower circuit: 20% below listing price for the first 10 trading days",
      "Grey Market Premium (GMP) before listing was the informal predictor — IPOpulse tracks GMP accuracy",
      "Lock-in for promoters: 18 months from listing date",
    ],
  },
];

export default function IpoProcessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
            <FileText className="w-3.5 h-3.5" />
            Complete Guide · Mainboard IPO · SEBI Regulations
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            How an IPO Works in India — Complete Step-by-Step Process
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            From the moment a company decides to list to the day shares begin trading — the full
            9-step IPO lifecycle with timelines, key players, and what retail investors need to watch at each stage.
          </p>
        </div>

        {/* Timeline overview */}
        <div className="card mb-8 bg-indigo-50 border-indigo-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">IPO Timeline Overview</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Company prep", time: "3–12 months before" },
              { label: "DRHP filing", time: "D-60 to D-90" },
              { label: "SEBI review", time: "30–75 days" },
              { label: "Roadshow", time: "2–4 weeks before" },
              { label: "IPO open", time: "3 days" },
              { label: "Allotment", time: "D+5" },
              { label: "Listing", time: "D+6" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg px-3 py-2 border border-indigo-100 text-center min-w-[90px]">
                <div className="text-xs font-semibold text-indigo-700">{item.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-indigo-600">STEP {step.number}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{step.duration}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mb-2">{step.title}</h2>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Investor checklist */}
        <div className="card mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Retail Investor IPO Checklist
          </h2>
          <div className="space-y-3">
            {[
              { step: "Before bidding", items: ["Read the RHP business overview and risk factors", "Check anchor investor list on BSE/NSE", "Check GMP trend on IPOpulse", "Verify the subscription category you fall under (retail vs HNI)"] },
              { step: "While bidding", items: ["Bid at cut-off price (recommended for retail — ensures allotment at whatever final price is set)", "Ensure UPI mandate is approved within 30 minutes", "One application per PAN per category", "Can submit up to 3 applications from different bank accounts in same PAN (applies for retail)"] },
              { step: "After bidding", items: ["Check allotment status on registrar site or IPOpulse /ipo/allotment", "Verify shares in demat before listing day", "Decide listing day strategy before market opens (not in the heat of the moment)", "Track 30-day anchor lock-in expiry for holding decisions"] },
            ].map((section) => (
              <div key={section.step}>
                <div className="text-xs font-semibold text-indigo-600 uppercase mb-2">{section.step}</div>
                <ul className="space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key roles */}
        <div className="card mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Key Players in an IPO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { role: "BRLM (Investment Bank)", desc: "Book Running Lead Manager. Manages entire IPO process, builds order book, prices the IPO. Examples: Kotak, Axis, ICICI, JM Financial." },
              { role: "SEBI", desc: "Regulator. Reviews DRHP, issues observations, ensures compliance with IPO disclosure norms." },
              { role: "Registrar to Issue", desc: "Processes applications, conducts allotment lottery, manages refunds. KFintech, Linkintime, Bigshare are the main registrars in India." },
              { role: "Depositories (CDSL/NSDL)", desc: "Credit allotted shares to investor demat accounts. CDSL for most discount brokers; NSDL for bank-backed brokers." },
              { role: "Anchor Investors", desc: "Large QIBs who receive shares 1 day before IPO. Their participation signals institutional confidence." },
              { role: "ASBA Banker / UPI App", desc: "Your bank blocks funds via ASBA, or your UPI app approves the mandate. No fund transfer until allotment." },
            ].map((player) => (
              <div key={player.role} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-900 mb-1">{player.role}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{player.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related pages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/ipo", label: "All IPOs", desc: "Live, upcoming, and listed IPOs" },
            { href: "/ipo/allotment", label: "Check Allotment", desc: "Check your IPO allotment status" },
            { href: "/learn/drhp-guide", label: "How to Read DRHP", desc: "Red flags, key sections, financials" },
            { href: "/learn/ipo-anchor-investors", label: "Anchor Investors", desc: "Why anchor quality matters" },
            { href: "/learn/understanding-ipo-subscription", label: "Subscription Explained", desc: "QIB, HNI, retail categories" },
            { href: "/learn/ipo-gmp", label: "GMP Guide", desc: "What grey market premium means" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card hover:border-indigo-300 transition group"
            >
              <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                {link.label} →
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
