"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveGmpEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: "Not authenticated" };

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

  return { ok: true };
}

export async function deleteGmpEntry(id: number) {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, error: "Not authenticated" };
  await prisma.ipoGmp.delete({ where: { id } });
  revalidatePath("/sup-min/gmp");
  return { ok: true };
}
