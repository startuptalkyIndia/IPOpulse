"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { maybePingSitemap } from "@/lib/seo-ping";

export async function saveGmpEntry(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.email || (role !== "admin" && role !== "superadmin")) {
    return { ok: false, error: "Forbidden" };
  }

  const ipoId = Number(formData.get("ipoId"));
  const dateStr = String(formData.get("date") ?? "");
  const gmp = Number(formData.get("gmp"));
  const kostakRaw = formData.get("kostak");
  const saudaRaw = formData.get("subjectToSauda");
  const source = String(formData.get("source") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!ipoId || !dateStr || !Number.isFinite(gmp)) {
    return { ok: false, error: "Please fill IPO, date, and GMP." };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };
  date.setHours(0, 0, 0, 0);

  await prisma.ipoGmp.upsert({
    where: { ipoId_date: { ipoId, date } },
    update: {
      gmp,
      kostak: kostakRaw ? Number(kostakRaw) : null,
      subjectToSauda: saudaRaw ? Number(saudaRaw) : null,
      source,
      notes,
      enteredBy: session.user.email,
    },
    create: {
      ipoId,
      date,
      gmp,
      kostak: kostakRaw ? Number(kostakRaw) : null,
      subjectToSauda: saudaRaw ? Number(saudaRaw) : null,
      source,
      notes,
      enteredBy: session.user.email,
    },
  });

  revalidatePath("/sup-min/gmp");
  revalidatePath("/ipo");
  const ipo = await prisma.ipo.findUnique({ where: { id: ipoId }, select: { slug: true } });
  if (ipo) revalidatePath(`/ipo/${ipo.slug}`);

  // Best-effort ping search engines after a publish event (throttled to 1/hr internally)
  maybePingSitemap().catch(() => {});

  return { ok: true };
}

export async function saveSubscriptionEntry(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.email || (role !== "admin" && role !== "superadmin")) {
    return { ok: false, error: "Forbidden" };
  }

  const ipoId = Number(formData.get("ipoId"));
  const retailX  = formData.get("retailX")  ? Number(formData.get("retailX"))  : null;
  const hniX     = formData.get("hniX")     ? Number(formData.get("hniX"))     : null;
  const qibX     = formData.get("qibX")     ? Number(formData.get("qibX"))     : null;
  const totalX   = formData.get("totalX")   ? Number(formData.get("totalX"))   : null;
  const employeeX = formData.get("employeeX") ? Number(formData.get("employeeX")) : null;

  if (!ipoId) return { ok: false, error: "Select an IPO" };

  const capturedAt = new Date();
  capturedAt.setSeconds(0, 0);

  await prisma.ipoSubscription.create({
    data: { ipoId, capturedAt, retailX, hniX, qibX, totalX, employeeX },
  });

  revalidatePath("/sup-min/gmp");
  const ipo = await prisma.ipo.findUnique({ where: { id: ipoId }, select: { slug: true } });
  if (ipo) revalidatePath(`/ipo/${ipo.slug}`);

  return { ok: true };
}

export async function saveListingEntry(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.email || (role !== "admin" && role !== "superadmin")) {
    return { ok: false, error: "Forbidden" };
  }

  const ipoId = Number(formData.get("ipoId"));
  const listingPrice = Number(formData.get("listingPrice"));
  const dayClose = formData.get("dayClose") ? Number(formData.get("dayClose")) : null;
  const dayHigh = formData.get("dayHigh") ? Number(formData.get("dayHigh")) : null;
  const dayLow = formData.get("dayLow") ? Number(formData.get("dayLow")) : null;

  if (!ipoId || !Number.isFinite(listingPrice) || listingPrice <= 0) {
    return { ok: false, error: "IPO and listing price are required." };
  }

  const ipo = await prisma.ipo.findUnique({
    where: { id: ipoId },
    select: { slug: true, priceBandHigh: true },
  });
  if (!ipo) return { ok: false, error: "IPO not found" };

  const issuePrice = ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null;
  const listingGainsPct = issuePrice
    ? ((listingPrice - issuePrice) / issuePrice) * 100
    : 0;

  // Get last GMP entry before listing date
  const lastGmp = await prisma.ipoGmp.findFirst({
    where: { ipoId },
    orderBy: { date: "desc" },
    select: { gmp: true },
  });
  const gmpAtListing = lastGmp ? Number(lastGmp.gmp) : null;
  const predictedPct = issuePrice && gmpAtListing != null
    ? (gmpAtListing / issuePrice) * 100
    : null;
  const gmpError = predictedPct != null ? predictedPct - listingGainsPct : null;

  await prisma.ipoListing.upsert({
    where: { ipoId },
    create: {
      ipoId,
      listingPrice,
      listingGainsPct,
      dayClose: dayClose ?? undefined,
      dayHigh: dayHigh ?? undefined,
      dayLow: dayLow ?? undefined,
      gmpAtListing,
      gmpError,
    },
    update: {
      listingPrice,
      listingGainsPct,
      dayClose: dayClose ?? undefined,
      dayHigh: dayHigh ?? undefined,
      dayLow: dayLow ?? undefined,
      gmpAtListing: gmpAtListing ?? undefined,
      gmpError: gmpError ?? undefined,
    },
  });

  revalidatePath("/sup-min/gmp");
  revalidatePath(`/ipo/${ipo.slug}`);
  revalidatePath("/ipo/gmp-accuracy");
  maybePingSitemap().catch(() => {});

  return { ok: true };
}

export async function deleteGmpEntry(id: number) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.email || (role !== "admin" && role !== "superadmin")) {
    return { ok: false, error: "Forbidden" };
  }
  await prisma.ipoGmp.delete({ where: { id } });
  revalidatePath("/sup-min/gmp");
  return { ok: true };
}
