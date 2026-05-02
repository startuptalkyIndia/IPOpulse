import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { renderDigestHtml } from "@/lib/digest";

/**
 * Daily IPO digest email. Runs every weekday at 07:00 IST.
 * Sends one email per verified subscriber. Best-effort — failures are logged
 * but don't abort the run; Resend handles bounces.
 */
export async function sendDailyDigest(): Promise<{ rowsIn: number; rowsError?: number; notes?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { rowsIn: 0, notes: "RESEND_API_KEY missing — skipped" };
  }
  const fromAddr = process.env.DIGEST_FROM ?? "IPOpulse Daily <hello@ipopulse.talkytools.com>";

  const resend = new Resend(apiKey);

  // Pull subscriber list
  const subs = await prisma.newsletterSub.findMany({
    where: { verified: true },
    select: { email: true },
  });
  if (subs.length === 0) return { rowsIn: 0, notes: "No verified subscribers." };

  // Pull today's content
  const now = new Date();
  const next30 = new Date(now.getTime() + 30 * 86400000);
  const [liveIpos, upcomingIpos, todayFiiDii] = await Promise.all([
    prisma.ipo.findMany({ where: { status: "live" }, orderBy: { closeDate: "asc" }, take: 5 }),
    prisma.ipo.findMany({
      where: { status: "upcoming", openDate: { lte: next30, gte: now } },
      orderBy: { openDate: "asc" },
      take: 5,
    }),
    prisma.fiiDiiDaily.findFirst({ orderBy: { date: "desc" } }),
  ]);

  if (liveIpos.length === 0 && upcomingIpos.length === 0) {
    return { rowsIn: 0, notes: "No live or upcoming IPOs in 30-day window — digest skipped." };
  }

  const html = renderDigestHtml({ liveIpos, upcomingIpos, todayFiiDii });
  const subject = `IPOpulse Daily — ${liveIpos.length} live, ${upcomingIpos.length} upcoming`;

  let sent = 0;
  let failed = 0;
  // Resend allows batch via array; we chunk in 50s to stay safe
  const CHUNK = 50;
  for (let i = 0; i < subs.length; i += CHUNK) {
    const batch = subs.slice(i, i + CHUNK);
    try {
      // Use BCC pattern is not ideal for Resend — send individually but batched as parallel promises
      const results = await Promise.allSettled(
        batch.map((s) =>
          resend.emails.send({
            from: fromAddr,
            to: s.email,
            subject,
            html,
            headers: {
              "List-Unsubscribe": `<https://ipopulse.talkytools.com/unsubscribe?email=${encodeURIComponent(s.email)}>`,
            },
          }),
        ),
      );
      for (const r of results) {
        if (r.status === "fulfilled" && !("error" in (r.value ?? {}) && r.value?.error)) sent++;
        else failed++;
      }
    } catch {
      failed += batch.length;
    }
  }

  return {
    rowsIn: sent,
    rowsError: failed,
    notes: `Daily digest: sent=${sent} failed=${failed} liveIpos=${liveIpos.length} upcomingIpos=${upcomingIpos.length}`,
  };
}
