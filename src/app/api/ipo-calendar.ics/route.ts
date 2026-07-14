import { prisma } from "@/lib/db";

/**
 * IPO calendar export as iCalendar (.ics).
 *
 * Behaviour: returns ALL upcoming + live + recently-listed IPOs as events.
 * (A `?email=` personalization path was REMOVED — audit HIGH: it let anyone pass
 * any email to read that user's tracked IPOs and confirm account existence, and
 * nothing in the UI used it. Personalized feeds, if re-added, must use an
 * unguessable per-user token, never a plaintext email.)
 *
 * Each IPO becomes 4 separate events: Open, Close, Allotment, Listing.
 * Apple Calendar / Google Calendar / Outlook all subscribe via:
 *   https://ipopulse.talkytools.com/api/ipo-calendar.ics
 *
 * Event UIDs are stable so the calendar app updates rather than duplicating
 * when dates shift.
 */

function fmtIcsDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  // YYYYMMDD for all-day events
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function escape(s: string | null | undefined): string {
  return (s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function event({ uid, summary, date, url, description }: { uid: string; summary: string; date: string; url: string; description: string }): string {
  // All-day VEVENT — no VTIMEZONE needed
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@ipopulse.talkytools.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${escape(description)}`,
    `URL:${url}`,
    "END:VEVENT",
  ].join("\r\n");
}

export async function GET() {
  const userLabel = "All upcoming Indian IPOs";

  const now = new Date();
  const past14 = new Date(now.getTime() - 14 * 86400000);
  const future120 = new Date(now.getTime() + 120 * 86400000);

  const where = {
    OR: [
      { status: { in: ["upcoming", "live"] } },
      { listingDate: { gte: past14, lte: future120 } },
    ],
  };

  const ipos = await prisma.ipo.findMany({
    where,
    orderBy: { openDate: "asc" },
    take: 100,
  });

  const events: string[] = [];
  for (const ipo of ipos) {
    const baseUrl = `https://ipopulse.talkytools.com/ipo/${ipo.slug}`;
    const desc = `${ipo.type === "sme" ? "SME IPO" : "Mainboard IPO"} · ${ipo.priceBandLow ?? "?"}–${ipo.priceBandHigh ?? "?"} band · Lot ${ipo.lotSize ?? "?"}`;

    const open = fmtIcsDate(ipo.openDate);
    const close = fmtIcsDate(ipo.closeDate);
    const allot = fmtIcsDate(ipo.allotmentDate);
    const list = fmtIcsDate(ipo.listingDate);

    if (open) events.push(event({ uid: `ipo-${ipo.id}-open`, summary: `${ipo.name} IPO opens`, date: open, url: baseUrl, description: desc }));
    if (close) events.push(event({ uid: `ipo-${ipo.id}-close`, summary: `${ipo.name} IPO closes (last day to apply)`, date: close, url: baseUrl, description: desc }));
    if (allot) events.push(event({ uid: `ipo-${ipo.id}-allotment`, summary: `${ipo.name} allotment`, date: allot, url: `${baseUrl}#allotment`, description: desc }));
    if (list) events.push(event({ uid: `ipo-${ipo.id}-listing`, summary: `${ipo.name} lists on exchange`, date: list, url: baseUrl, description: desc }));
  }

  const cal = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IPOpulse//IPO Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escape(`IPOpulse — ${userLabel}`)}`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    `X-WR-CALDESC:${escape(`Indian IPO open / close / allotment / listing dates from ipopulse.talkytools.com.`)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(cal, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="ipopulse-all.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
