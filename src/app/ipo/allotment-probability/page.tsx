import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AllotmentProbCalc } from "./AllotmentProbCalc";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IPO Allotment Probability Calculator — chances of getting allotment",
  description:
    "Calculate your probability of getting an Indian IPO allotment based on subscription multiple, category (retail/HNI/QIB), and lots applied. SEBI-rule-based.",
  alternates: { canonical: "/ipo/allotment-probability" },
};

export default async function AllotmentProbPage() {
  const liveAndClosed = await prisma.ipo.findMany({
    where: { status: { in: ["live", "closed"] } },
    include: { subscriptions: { orderBy: { capturedAt: "desc" }, take: 1 } },
    orderBy: { closeDate: "asc" },
    take: 12,
  });

  const ipoSeed = liveAndClosed
    .filter((i) => i.subscriptions[0])
    .map((i) => ({
      slug: i.slug,
      name: i.name,
      type: i.type,
      retailX: i.subscriptions[0].retailX ? Number(i.subscriptions[0].retailX) : 1,
      hniX: i.subscriptions[0].hniX ? Number(i.subscriptions[0].hniX) : 1,
      qibX: i.subscriptions[0].qibX ? Number(i.subscriptions[0].qibX) : 1,
      lotMinValue: i.lotSize && i.priceBandHigh ? i.lotSize * Number(i.priceBandHigh) : 14000,
    }));

  return (
    <div className="space-y-6">
      <Link href="/ipo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> IPO Dashboard
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">IPO Allotment Probability</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          The math behind &quot;will I get allotment?&quot; SEBI rule: in oversubscribed retail, every successful applicant
          gets exactly one minimum lot via lottery — never partial more. Pick a current IPO or enter custom numbers.
        </p>
      </div>

      <AllotmentProbCalc liveIpos={ipoSeed} />

      <div className="card max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How allotment actually works</h2>
        <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
          <li>
            <strong>Retail (≤₹2L application):</strong> If oversubscribed, allotment is by lottery. Each successful
            applicant gets exactly <em>one minimum lot</em>. Multiple lots applied don&apos;t increase your odds — you still
            either get 1 lot or zero.
          </li>
          <li>
            <strong>S-HNI (₹2L–₹10L):</strong> Proportionate allotment. If 5× subscribed, you get ~20% of applied.
          </li>
          <li>
            <strong>B-HNI (&gt;₹10L):</strong> Same as S-HNI — proportionate.
          </li>
          <li>
            <strong>QIB:</strong> Discretionary within the QIB pool. Anchor allotment is locked in 60% of QIB before
            issue opens.
          </li>
          <li>
            <strong>Pro tip:</strong> Multiple PANs from the same household are pooled — only one application counts.
            Apply early to avoid bid rejections close to deadline.
          </li>
        </ul>
      </div>
    </div>
  );
}
