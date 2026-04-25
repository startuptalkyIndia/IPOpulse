import { prisma } from "@/lib/db";
import { fetchBseAnnouncements } from "@/lib/scrapers/bse-announcements";
import type { IngestionResult } from "../runIngestion";

/**
 * Ingest BSE corporate announcements (running every 2 hours during market days).
 *
 * Maps to:
 *   - announcements table: every announcement
 *   - corporate_actions table: a subset (dividend / split / bonus / rights / buyback / agm / board_meeting)
 *
 * Dedupe via source + sourceId (BSE's NEWSID).
 */

const ACTION_KEYWORDS: Record<string, string> = {
  dividend: "dividend",
  bonus: "bonus",
  split: "split",
  "stock split": "split",
  rights: "rights",
  buyback: "buyback",
  "buy back": "buyback",
  agm: "agm",
  "board meeting": "board_meeting",
};

function detectActionType(headline: string, category: string): string | null {
  const lower = `${headline} ${category}`.toLowerCase();
  for (const [k, v] of Object.entries(ACTION_KEYWORDS)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

export async function ingestBseAnnouncements(): Promise<IngestionResult> {
  const items = await fetchBseAnnouncements(2);
  if (items.length === 0) return { rowsIn: 0, notes: "no rows" };

  const allCompanies = await prisma.company.findMany({
    where: { bseCode: { not: null } },
    select: { id: true, bseCode: true, slug: true, name: true },
  });
  const codeToCompany = new Map(allCompanies.map((c) => [c.bseCode!, c]));

  let annIn = 0;
  let actIn = 0;
  let errs = 0;

  for (const it of items) {
    try {
      const company = codeToCompany.get(it.scripCode);

      // Insert announcement (idempotent on source+sourceId)
      await prisma.announcement.upsert({
        where: { source_sourceId: { source: "bse", sourceId: it.sourceId } },
        update: {
          headline: it.headline,
          category: it.category,
          subcategory: it.subcategory,
          pdfUrl: it.pdfUrl,
          broadcastAt: it.broadcastAt,
          companyId: company?.id ?? null,
        },
        create: {
          source: "bse",
          sourceId: it.sourceId,
          headline: it.headline,
          category: it.category,
          subcategory: it.subcategory,
          pdfUrl: it.pdfUrl,
          broadcastAt: it.broadcastAt,
          bseCode: it.scripCode,
          companyId: company?.id ?? null,
        },
      });
      annIn++;

      // Detect corporate action
      const actType = detectActionType(it.headline, it.category);
      if (actType && company) {
        await prisma.corporateAction.upsert({
          where: { source_sourceId: { source: "bse", sourceId: it.sourceId } },
          update: { actionType: actType, purpose: it.headline },
          create: {
            companyId: company.id,
            actionType: actType,
            purpose: it.headline,
            source: "bse",
            sourceId: it.sourceId,
          },
        });
        actIn++;
      }
    } catch {
      errs++;
    }
  }

  return { rowsIn: annIn, rowsError: errs, notes: `${annIn} announcements, ${actIn} corp actions` };
}
