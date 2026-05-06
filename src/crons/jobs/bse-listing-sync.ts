/**
 * BSE Listing Sync
 * -----------------
 * Finds IPOs that are marked "listed" but don't have an IpoListing record yet.
 * For each one:
 *   1. Looks up BhavcopyDaily for the listing date (NSE or BSE symbol)
 *   2. Calculates listing gain % vs issue price (priceBandHigh)
 *   3. Fetches the last IpoGmp entry before the listing date → gmpAtListing
 *   4. Creates the IpoListing record
 *
 * This is the pipeline that powers the GMP Accuracy Scorecard.
 * Schedule: Daily at 8:00 PM IST (after bhavcopy runs at 7:00 PM)
 */

import { prisma } from "@/lib/db";
import type { IngestionResult } from "../runIngestion";

export async function syncIpoListings(): Promise<IngestionResult> {
  // Find IPOs that have a listingDate in the past but no IpoListing record
  const now = new Date();
  const listedIpos = await prisma.ipo.findMany({
    where: {
      status: "listed",
      listingDate: { lte: now },
      listing: null, // no IpoListing yet
    },
    select: {
      id: true,
      name: true,
      slug: true,
      nseSymbol: true,
      bseCode: true,
      listingDate: true,
      priceBandHigh: true,
      gmpEntries: {
        orderBy: { date: "desc" },
        take: 1,
        select: { gmp: true, date: true },
      },
    },
    take: 50, // process max 50 per run
  });

  let rowsIn = 0;

  for (const ipo of listedIpos) {
    if (!ipo.listingDate || !ipo.priceBandHigh) continue;
    const issuePrice = Number(ipo.priceBandHigh);
    if (!issuePrice) continue;

    // Get the listing day's bhavcopy data
    const listingDay = new Date(ipo.listingDate);
    listingDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(listingDay);
    nextDay.setDate(nextDay.getDate() + 1);

    // Try to find bhavcopy data for listing day
    let bhavRow = null;

    if (ipo.nseSymbol) {
      const co = await prisma.company.findUnique({
        where: { nseSymbol: ipo.nseSymbol },
        select: { id: true },
      });
      if (co) {
        bhavRow = await prisma.bhavcopyDaily.findFirst({
          where: { companyId: co.id, date: { gte: listingDay, lt: nextDay } },
          select: { open: true, high: true, low: true, close: true, volume: true },
        });
      }
    }

    if (!bhavRow && ipo.bseCode) {
      const co = await prisma.company.findUnique({
        where: { bseCode: ipo.bseCode },
        select: { id: true },
      });
      if (co) {
        bhavRow = await prisma.bhavcopyDaily.findFirst({
          where: { companyId: co.id, date: { gte: listingDay, lt: nextDay } },
          select: { open: true, high: true, low: true, close: true, volume: true },
        });
      }
    }

    // We need at least a listing price to proceed
    if (!bhavRow?.open && !bhavRow?.close) continue;

    const listingPrice = Number(bhavRow.open ?? bhavRow.close);
    const listingGainsPct = ((listingPrice - issuePrice) / issuePrice) * 100;

    // Get last GMP entry before listing date as gmpAtListing
    const lastGmp = ipo.gmpEntries[0];
    const gmpAtListing =
      lastGmp && lastGmp.date <= ipo.listingDate ? Number(lastGmp.gmp) : null;

    // Calculate gmpError = predicted listing gain - actual listing gain
    const predictedPct =
      gmpAtListing != null ? (gmpAtListing / issuePrice) * 100 : null;
    const gmpError = predictedPct != null ? predictedPct - listingGainsPct : null;

    // Create IpoListing record
    await prisma.ipoListing.upsert({
      where: { ipoId: ipo.id },
      create: {
        ipoId: ipo.id,
        listingPrice,
        listingGainsPct,
        dayClose: bhavRow.close ? Number(bhavRow.close) : undefined,
        dayHigh: bhavRow.high ? Number(bhavRow.high) : undefined,
        dayLow: bhavRow.low ? Number(bhavRow.low) : undefined,
        gmpAtListing,
        gmpError,
      },
      update: {
        listingPrice,
        listingGainsPct,
        dayClose: bhavRow.close ? Number(bhavRow.close) : undefined,
        dayHigh: bhavRow.high ? Number(bhavRow.high) : undefined,
        dayLow: bhavRow.low ? Number(bhavRow.low) : undefined,
        gmpAtListing: gmpAtListing ?? undefined,
        gmpError: gmpError ?? undefined,
      },
    });

    rowsIn++;
  }

  return { rowsIn };
}
