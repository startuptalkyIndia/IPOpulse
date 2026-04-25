export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Building2 } from "lucide-react";
import { registrars } from "@/lib/registrars";
import { prisma } from "@/lib/db";
import { ApplyIpoCtaRow } from "@/components/AffiliateCta";
import { formatDate, formatPriceBand, formatIssueSize, computeIpoStatus, statusBadgeClass, statusLabel } from "@/lib/ipo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return registrars.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = registrars.find((x) => x.slug === slug);
  if (!r) return { title: "Registrar not found" };
  return {
    title: `${r.name} IPO Allotment Status & Past IPOs | ${r.shortName}`,
    description: `Check IPO allotment status on ${r.name}. List of all IPOs handled by ${r.shortName} with subscription, GMP, listing dates and listing performance. Direct allotment link.`,
    alternates: { canonical: `/registrar/${slug}` },
  };
}

export default async function RegistrarPage({ params }: Props) {
  const { slug } = await params;
  const r = registrars.find((x) => x.slug === slug);
  if (!r) notFound();

  // Find IPOs handled by this registrar (best-effort match on name)
  const matchTerm = r.shortName.toLowerCase();
  const ipos = await prisma.ipo.findMany({
    where: {
      OR: [
        { registrar: { contains: r.shortName, mode: "insensitive" } },
        { registrar: { contains: r.name, mode: "insensitive" } },
        { registrar: { contains: matchTerm, mode: "insensitive" } },
      ],
    },
    include: { listing: true },
    orderBy: { listingDate: "desc" },
    take: 100,
  });

  const upcoming = ipos.filter((i) => i.status === "upcoming" || i.status === "live");
  const closed = ipos.filter((i) => i.status === "closed");
  const listed = ipos.filter((i) => i.status === "listed");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link href="/ipo/allotment" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> All registrars
      </Link>

      <div className="card">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{r.name}</h1>
            <div className="text-sm text-gray-500 mt-1">{r.shortName} · IPO registrar</div>
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">{r.description}</p>
          </div>
          <a
            href={r.allotmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs inline-flex items-center gap-1 flex-shrink-0"
          >
            Check Allotment <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">How to check allotment on {r.shortName}</h2>
        <ol className="text-sm text-gray-700 space-y-1.5 list-decimal pl-5">
          <li>Open <a className="text-indigo-600 underline" href={r.allotmentUrl} target="_blank" rel="noreferrer">{r.allotmentUrl}</a></li>
          <li>Select the IPO from the dropdown (only IPOs handled by {r.shortName} appear).</li>
          <li>Choose your identifier — PAN works on all registrars; some accept Application No. or DP-Client ID.</li>
          <li>Submit the captcha. The status appears immediately: Allotted X shares / Not allotted / Pending.</li>
          <li>If allotted, shares typically credit to your Demat 1 day before listing.</li>
        </ol>
      </div>

      <ApplyIpoCtaRow />

      {upcoming.length > 0 ? (
        <IposTable title={`Upcoming & live IPOs on ${r.shortName}`} ipos={upcoming} />
      ) : null}
      {closed.length > 0 ? (
        <IposTable title={`Closed — awaiting allotment on ${r.shortName}`} ipos={closed} />
      ) : null}
      {listed.length > 0 ? (
        <IposTable title={`Recent listings on ${r.shortName}`} ipos={listed} variant="listed" />
      ) : null}

      {ipos.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-500">
          We&apos;re still indexing IPOs handled by {r.shortName}. Check back soon — or use the allotment link above directly.
        </div>
      ) : null}

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-2">FAQ — {r.shortName} allotment</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>When is the allotment date?</strong>
            <p className="text-gray-600 mt-1">Typically T+1 working day after the IPO closes. SEBI&apos;s T+3 listing timeline means allotment finalises 1-2 days before listing.</p>
          </div>
          <div>
            <strong>Why isn&apos;t my IPO showing on {r.shortName}?</strong>
            <p className="text-gray-600 mt-1">Each IPO has exactly one registrar. Check your allotment advice email — it lists the registrar. If the registrar isn&apos;t {r.shortName}, use one of <Link className="underline" href="/ipo/allotment">our other registrar pages</Link>.</p>
          </div>
          <div>
            <strong>Can I check without an application number?</strong>
            <p className="text-gray-600 mt-1">Yes — PAN works on {r.shortName}. Only enter the application number if you used multiple PAN-linked Demats.</p>
          </div>
          <div>
            <strong>How long do unallotted refunds take?</strong>
            <p className="text-gray-600 mt-1">For ASBA applications (UPI, net-banking), funds are simply unblocked from your bank — usually within 1 working day of allotment. No refund processing needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IposTable({ title, ipos, variant = "default" }: { title: string; ipos: Awaited<ReturnType<typeof prisma.ipo.findMany>>; variant?: "default" | "listed" }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Price band</th>
                <th className="px-3 py-3">Issue size</th>
                <th className="px-3 py-3">{variant === "listed" ? "Listed" : "Open"}</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo) => {
                const status = computeIpoStatus(ipo);
                return (
                  <tr key={ipo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">
                      <Link href={`/ipo/${ipo.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {ipo.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700 tabular-nums">{formatPriceBand(ipo)}</td>
                    <td className="px-3 py-3 text-xs text-gray-700 tabular-nums">
                      {formatIssueSize(ipo.issueSize ? Number(ipo.issueSize) : null)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {variant === "listed" ? formatDate(ipo.listingDate) : formatDate(ipo.openDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
