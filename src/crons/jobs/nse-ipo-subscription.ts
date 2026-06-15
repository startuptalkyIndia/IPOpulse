/**
 * NSE IPO Subscription (Demand) Tracker
 * ─────────────────────────────────────────────────────────────────
 * The other half of the "should I apply?" decision (GMP is the first half).
 * NSE's /api/ipo-detail?symbol=X returns live category-wise bid details —
 * how many times each investor category has subscribed — updated through
 * the IPO window and finalised after close.
 *
 * bidDetails categories (matched by name keyword, robust to srNo changes):
 *   Qualified Institutional Buyers(QIBs)            → qibX
 *   Non Institutional Investors                     → hniX  (total NII)
 *   Non Institutional Investors(... Ten Lakh ...)   → nii1X (bHNI, >₹10L)
 *   Non Institutional Investors(... Two Lakh ...)   → nii2X (sHNI, ₹2–10L)
 *   Retail Individual Investors(RIIs)               → retailX
 *   Employee(s) / Employee Reservation              → employeeX
 *   Total                                           → totalX
 *
 * Snapshots one row per IPO per run into ipo_subscription (capturedAt), so the
 * detail page's SubscriptionBar + velocity-over-time chart fill automatically.
 * Targets live + recently-closed IPOs with an nseSymbol. Runs every 30 min
 * during IPO windows; cheap (one call per active IPO, usually 1–5).
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";
import { fetchNse } from "@/lib/nse-session";

interface BidRow {
  category: string;
  noOfTime?: string;        // times subscribed, e.g. "12.34"
  noOfsharesBid?: string;
  noOfSharesOffered?: string;
  srNo?: string;
}
interface IpoDetail {
  companyName?: string;
  bidDetails?: BidRow[];
}

function num(s: string | undefined): number | null {
  if (s == null) return null;
  const v = parseFloat(s.replace(/,/g, ""));
  return isFinite(v) ? v : null;
}

/** Map NSE bidDetails rows → our subscription multiples. */
function parseBidDetails(rows: BidRow[]) {
  const out = {
    qibX: null as number | null,
    hniX: null as number | null,
    nii1X: null as number | null,
    nii2X: null as number | null,
    retailX: null as number | null,
    employeeX: null as number | null,
    totalX: null as number | null,
  };
  for (const r of rows) {
    const c = (r.category ?? "").toLowerCase();
    const t = num(r.noOfTime);
    if (t == null) continue;
    if (c.startsWith("total")) out.totalX = t;
    else if (c.includes("qualified institutional")) out.qibX = t;
    else if (c.includes("retail individual")) out.retailX = t;
    else if (c.includes("employee")) out.employeeX = t;
    else if (c.includes("non institutional")) {
      if (c.includes("ten lakh")) out.nii1X = t;          // >₹10L (bHNI)
      else if (c.includes("two lakh")) out.nii2X = t;     // ₹2–10L (sHNI)
      else out.hniX = t;                                   // parent NII total
    }
  }
  // If NSE didn't give a parent NII figure, fall back to the larger sub-bucket
  if (out.hniX == null) out.hniX = out.nii1X ?? out.nii2X;
  return out;
}

export async function ingestIpoSubscription(): Promise<IngestionResult> {
  // Live + recently-closed (finals settle a day or two after close) with a symbol
  const cutoff = new Date(Date.now() - 4 * 86400000);
  const ipos = await prisma.ipo.findMany({
    where: {
      nseSymbol: { not: null },
      OR: [
        { status: "live" },
        { status: "closed", closeDate: { gte: cutoff } },
      ],
    },
    select: { id: true, name: true, nseSymbol: true },
  });

  if (ipos.length === 0) {
    return { rowsIn: 0, notes: "No live/recently-closed IPOs with NSE symbol." };
  }

  const now = new Date();
  let saved = 0;
  let empty = 0;
  const errors: string[] = [];

  for (const ipo of ipos) {
    try {
      const detail = await fetchNse<IpoDetail>(`/api/ipo-detail?symbol=${encodeURIComponent(ipo.nseSymbol!)}`);
      const rows = detail?.bidDetails ?? [];
      if (rows.length === 0) {
        empty++;
        continue;
      }
      const sub = parseBidDetails(rows);
      // Skip if every category is null (issue not open yet / no data)
      if (Object.values(sub).every((v) => v == null)) {
        empty++;
        continue;
      }
      await prisma.ipoSubscription.create({
        data: { ipoId: ipo.id, capturedAt: now, ...sub },
      });
      saved++;
    } catch (e) {
      if (errors.length < 5) errors.push(`${ipo.nseSymbol}: ${e instanceof Error ? e.message : "?"}`);
    }
    // Be gentle with NSE between calls
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`[ipo-subscription] ${saved} snapshots saved, ${empty} empty, ${errors.length} errors of ${ipos.length} IPOs`);
  return {
    rowsIn: saved,
    rowsError: errors.length,
    notes: `${saved}/${ipos.length} snapshots${empty ? `, ${empty} no-data` : ""}${errors.length ? `; errors: ${errors.join("; ")}` : ""}`,
  };
}
