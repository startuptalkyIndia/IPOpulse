"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { maybePingSitemap } from "@/lib/seo-ping";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOptionalDecimal(val: FormDataEntryValue | null): number | null {
  if (!val || String(val).trim() === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalInt(val: FormDataEntryValue | null): number | null {
  if (!val || String(val).trim() === "") return null;
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(val: FormDataEntryValue | null): Date | null {
  if (!val || String(val).trim() === "") return null;
  const d = new Date(String(val));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseOptionalStr(val: FormDataEntryValue | null): string | null {
  if (!val || String(val).trim() === "") return null;
  return String(val).trim();
}

export async function saveIpoEntry(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.email || (role !== "admin" && role !== "superadmin")) {
    return { ok: false, error: "Forbidden" };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const type = String(formData.get("type") ?? "mainboard");
  const status = String(formData.get("status") ?? "upcoming");

  const slug = slugify(name);
  if (!slug) return { ok: false, error: "Could not generate slug from name." };

  const data = {
    name,
    type,
    status,
    priceBandLow: parseOptionalDecimal(formData.get("priceBandLow")),
    priceBandHigh: parseOptionalDecimal(formData.get("priceBandHigh")),
    lotSize: parseOptionalInt(formData.get("lotSize")),
    issueSize: parseOptionalDecimal(formData.get("issueSize")),
    openDate: parseOptionalDate(formData.get("openDate")),
    closeDate: parseOptionalDate(formData.get("closeDate")),
    allotmentDate: parseOptionalDate(formData.get("allotmentDate")),
    listingDate: parseOptionalDate(formData.get("listingDate")),
    registrar: parseOptionalStr(formData.get("registrar")),
    leadManagers: parseOptionalStr(formData.get("leadManagers")),
    drhpUrl: parseOptionalStr(formData.get("drhpUrl")),
    rhpUrl: parseOptionalStr(formData.get("rhpUrl")),
    bseCode: parseOptionalStr(formData.get("bseCode")),
    nseSymbol: parseOptionalStr(formData.get("nseSymbol")),
    faceValue: parseOptionalDecimal(formData.get("faceValue")),
    objectsOfIssue: parseOptionalStr(formData.get("objectsOfIssue")),
  };

  await prisma.ipo.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });

  revalidatePath("/sup-min/ipos");
  revalidatePath("/ipo");
  revalidatePath(`/ipo/${slug}`);
  maybePingSitemap().catch(() => {});

  return { ok: true, slug };
}
