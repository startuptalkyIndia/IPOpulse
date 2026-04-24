import { prisma } from "@/lib/db";
import { fetchNseFiiDii } from "@/lib/scrapers/nse";
import type { IngestionResult } from "../runIngestion";

function parseNseDate(s: string): Date {
  // "24-Apr-2026"
  const [d, m, y] = s.split("-");
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const monthNum = months[m] ?? 0;
  const date = new Date(Number(y), monthNum, Number(d));
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function ingestNseFiiDii(): Promise<IngestionResult> {
  const rows = await fetchNseFiiDii();
  if (rows.length === 0) return { rowsIn: 0, notes: "no rows returned" };

  // Rows are (FII/FPI, DII) for a single date. Merge into one record per date.
  const byDate = new Map<string, {
    date: Date;
    fiiBuy?: number;
    fiiSell?: number;
    fiiNet?: number;
    diiBuy?: number;
    diiSell?: number;
    diiNet?: number;
  }>();

  for (const r of rows) {
    const date = parseNseDate(r.date);
    const key = date.toISOString();
    const entry = byDate.get(key) ?? { date };
    const isFii = r.category.toUpperCase().includes("FII") || r.category.toUpperCase().includes("FPI");
    if (isFii) {
      entry.fiiBuy = Number(r.buyValue);
      entry.fiiSell = Number(r.sellValue);
      entry.fiiNet = Number(r.netValue);
    } else {
      entry.diiBuy = Number(r.buyValue);
      entry.diiSell = Number(r.sellValue);
      entry.diiNet = Number(r.netValue);
    }
    byDate.set(key, entry);
  }

  let rowsIn = 0;
  for (const [, v] of byDate) {
    await prisma.fiiDiiDaily.upsert({
      where: { date_segment: { date: v.date, segment: "cash" } },
      update: {
        fiiBuy: v.fiiBuy,
        fiiSell: v.fiiSell,
        fiiNet: v.fiiNet,
        diiBuy: v.diiBuy,
        diiSell: v.diiSell,
        diiNet: v.diiNet,
      },
      create: {
        date: v.date,
        segment: "cash",
        fiiBuy: v.fiiBuy,
        fiiSell: v.fiiSell,
        fiiNet: v.fiiNet,
        diiBuy: v.diiBuy,
        diiSell: v.diiSell,
        diiNet: v.diiNet,
      },
    });
    rowsIn++;
  }

  return { rowsIn };
}
