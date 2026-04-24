export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatPriceBand, computeIpoStatus, statusBadgeClass, statusLabel } from "@/lib/ipo";
import { registrars, matchRegistrar } from "@/lib/registrars";

export const metadata: Metadata = {
  title: "IPO Allotment Status — Check for all 4 registrars in one click",
  description:
    "Check IPO allotment status for all Indian registrars — KFintech, Link Intime, Bigshare, Cameo, Integrated. Pick your IPO, we route you to the right registrar.",
  alternates: { canonical: "/ipo/allotment" },
};

export default async function IpoAllotmentHub() {
  const now = new Date();
  const past30 = new Date(now.getTime() - 30 * 86400000);

  const pending = await prisma.ipo.findMany({
    where: {
      OR: [
        { status: "closed" },
        { status: "live", closeDate: { lte: now } },
      ],
    },
    orderBy: { closeDate: "desc" },
  });

  const recentlyAllotted = await prisma.ipo.findMany({
    where: {
      status: { in: ["listed"] },
      listingDate: { gte: past30 },
    },
    orderBy: { listingDate: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          IPO Allotment Status — one place, every registrar
        </h1>
        <p className="text-sm text-gray-700 max-w-3xl">
          Skip hunting for the right registrar. Pick your IPO below — we route you straight to the right
          registrar (KFintech, Link Intime, Bigshare, Cameo, Integrated, Maashitla or Skyline) with the official
          status link and step-by-step instructions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {registrars.slice(0, 5).map((r) => (
            <span
              key={r.slug}
              className="badge bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1 text-[11px]"
            >
              {r.shortName}
            </span>
          ))}
          <span className="badge bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1 text-[11px]">
            +{registrars.length - 5} more
          </span>
        </div>
      </section>

      {/* IPOs awaiting / recently allotted */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            IPOs awaiting or in allotment window
          </h2>
        </div>
        {pending.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-gray-500">No IPOs in the allotment window right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pending.map((ipo) => {
              const reg = matchRegistrar(ipo.registrar);
              const status = computeIpoStatus(ipo);
              return (
                <div key={ipo.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Link href={`/ipo/${ipo.slug}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                        {ipo.name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {ipo.type === "sme" ? "SME IPO · " : "Mainboard IPO · "}
                        {formatPriceBand(ipo)}
                      </div>
                    </div>
                    <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <div className="text-gray-400">Allotment date</div>
                      <div className="font-medium text-gray-800">{formatDate(ipo.allotmentDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Listing date</div>
                      <div className="font-medium text-gray-800">{formatDate(ipo.listingDate)}</div>
                    </div>
                  </div>
                  {reg ? (
                    <a
                      href={ipo.registrarUrl || reg.allotmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full inline-flex items-center justify-center gap-1"
                    >
                      Check on {reg.shortName} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : ipo.registrarUrl ? (
                    <a
                      href={ipo.registrarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full inline-flex items-center justify-center gap-1"
                    >
                      Check on registrar <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-2">Registrar TBA</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Registrar directory */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Registrar directory</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {registrars.map((r) => (
            <a
              key={r.slug}
              href={r.allotmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-indigo-300 hover:shadow-sm transition group"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{r.name}</h3>
                <span className="text-xs text-indigo-600 group-hover:text-indigo-800 flex items-center gap-0.5 flex-shrink-0">
                  Open <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{r.description}</p>
              <p className="text-[11px] text-gray-400">{r.coverage}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Recently allotted */}
      {recentlyAllotted.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recently allotted &amp; listed</h2>
          </div>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
            {recentlyAllotted.map((ipo) => (
              <Link
                key={ipo.id}
                href={`/ipo/${ipo.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{ipo.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Listed {formatDate(ipo.listingDate)} · {ipo.type === "sme" ? "SME" : "Mainboard"}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* How-to */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How to check IPO allotment status</h2>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <div className="text-sm font-medium text-gray-900">Identify your registrar</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Every IPO has one registrar. Your allotment advice email and the IPO detail page both say which one.
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <div className="text-sm font-medium text-gray-900">Open the registrar's allotment page</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Use the links above. Bookmark the one that handles most IPOs you apply for.
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <div className="text-sm font-medium text-gray-900">Enter your details</div>
              <div className="text-xs text-gray-500 mt-0.5">
                PAN is the most reliable identifier. Some registrars also accept application number, DP ID, or account number.
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">4</span>
            <div>
              <div className="text-sm font-medium text-gray-900">Check your demat on listing day</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Allotted shares appear in demat 1 day before listing. If funds weren't blocked/debited → not allotted.
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Allotment FAQ</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900">When is the allotment date?</h3>
            <p className="text-gray-600 mt-1">
              Typically T+1 business day after close — so a 3-day IPO closing Friday usually has allotment
              Tuesday. SEBI's T+3 listing timeline means allotment happens before listing, which happens T+3.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Why didn't I get the allotment?</h3>
            <p className="text-gray-600 mt-1">
              Oversubscribed IPOs use a lottery for retail. Even with one lot applied, if subscription exceeds
              1x in retail, many applicants get nothing. Multiple PANs from the same household are pooled — only
              one application counts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">When will my money be refunded?</h3>
            <p className="text-gray-600 mt-1">
              For ASBA applications (default for UPI and net banking), the funds are simply unblocked from your
              bank account — usually within 1 working day of allotment. No refund needed.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Can I check without an application number?</h3>
            <p className="text-gray-600 mt-1">
              Yes — PAN works on all four major registrars. The application number is only needed if you used
              multiple PAN-linked demats.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
