import { Resend } from "resend";
import { prisma } from "@/lib/db";

const FROM_ADDR = "IPOpulse Alerts <alerts@ipopulse.talkytools.com>";

/**
 * Returns true when `date` is within ±1 day of today (IST). The ±1 window
 * protects against timing drift — e.g. a 00:01 cron might run slightly before
 * midnight or the date field is stored as noon UTC.
 */
function isAroundToday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const now = Date.now();
  const ONE_DAY_MS = 86_400_000;
  const diff = Math.abs(date.getTime() - now);
  return diff <= ONE_DAY_MS;
}

function buildEmailHtml(params: {
  userName: string;
  ipoName: string;
  alertType: string;
  conditionLine: string;
}): string {
  const { userName, ipoName, alertType: _alertType, conditionLine } = params;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IPOpulse Alert</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #4f46e5; padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { margin: 4px 0 0; color: #c7d2fe; font-size: 13px; }
    .body { padding: 28px 32px; }
    .body p { margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6; }
    .alert-box { background: #eef2ff; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .alert-box .ipo-name { font-size: 18px; font-weight: 700; color: #312e81; margin: 0 0 6px; }
    .alert-box .condition { font-size: 14px; color: #4338ca; margin: 0; }
    .cta { display: inline-block; margin-top: 8px; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { padding: 20px 32px; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>IPOpulse Alert Triggered</h1>
      <p>Your saved alert has fired</p>
    </div>
    <div class="body">
      <p>Hi ${userName || "there"},</p>
      <p>The alert you set for <strong>${ipoName}</strong> has just been triggered.</p>
      <div class="alert-box">
        <p class="ipo-name">${ipoName}</p>
        <p class="condition">${conditionLine}</p>
      </div>
      <p>Head over to IPOpulse to see the latest data and take action.</p>
      <a class="cta" href="https://ipopulse.talkytools.com">View on IPOpulse →</a>
    </div>
    <div class="footer">
      <p>
        You're receiving this because you set an alert on
        <a href="https://ipopulse.talkytools.com">IPOpulse</a>.
        <br />
        To manage your alerts, visit
        <a href="https://ipopulse.talkytools.com/my/alerts">My Alerts</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildSubject(ipoName: string, conditionLine: string): string {
  return `[IPOpulse Alert] ${ipoName} — ${conditionLine}`;
}

function describeCondition(alertType: string, threshold: number | null | undefined, gmpValue?: number): string {
  switch (alertType) {
    case "gmp_threshold":
      return threshold != null
        ? `GMP hit your ₹${threshold} threshold! Current GMP: ₹${gmpValue ?? "–"}`
        : `GMP threshold reached! Current GMP: ₹${gmpValue ?? "–"}`;
    case "subscription_open":
      return "Subscription is now open — apply today!";
    case "subscription_close":
      return "Subscription closes today — last chance to apply!";
    case "allotment":
      return "Allotment date has arrived — check your allotment status!";
    case "listing":
      return "Listing day is here — watch the opening price!";
    default:
      return `Alert condition met (${alertType})`;
  }
}

/**
 * Checks all active alerts, fires emails for those whose conditions are met,
 * then marks them as firedAt. Runs every 2 hours.
 *
 * Returns: { rowsIn: fired count, rowsError: failed count, notes }
 */
export async function checkIpoAlerts(): Promise<{
  rowsIn: number;
  rowsError?: number;
  notes?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  if (!apiKey) {
    // Still run the check and mark firedAt — just don't send emails
    // so alerts don't pile up and re-fire once the key is added.
  }

  // Fetch all active, un-fired alerts with their user data
  const alerts = await prisma.alert.findMany({
    where: {
      isActive: true,
      firedAt: null,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (alerts.length === 0) {
    return { rowsIn: 0, notes: "No active un-fired alerts." };
  }

  // Pre-fetch IPOs referenced by these alerts (by slug) to avoid N+1
  const slugs = [...new Set(alerts.map((a) => a.ipoSlug).filter(Boolean))] as string[];
  const ipos = await prisma.ipo.findMany({
    where: { slug: { in: slugs } },
    select: {
      id: true,
      slug: true,
      name: true,
      openDate: true,
      closeDate: true,
      allotmentDate: true,
      listingDate: true,
      status: true,
    },
  });
  const ipoBySlug = new Map(ipos.map((i) => [i.slug, i]));

  // Pre-fetch latest GMP for each IPO that has gmp_threshold alerts
  const gmpAlertSlugs = [...new Set(
    alerts
      .filter((a) => a.type === "gmp_threshold" && a.ipoSlug)
      .map((a) => a.ipoSlug as string)
  )];
  const latestGmpByIpoId = new Map<number, number>();
  if (gmpAlertSlugs.length > 0) {
    // Fetch latest GMP for each relevant IPO
    const gmpIpos = ipos.filter((i) => gmpAlertSlugs.includes(i.slug));
    for (const ipo of gmpIpos) {
      const latest = await prisma.ipoGmp.findFirst({
        where: { ipoId: ipo.id },
        orderBy: { date: "desc" },
        select: { gmp: true },
      });
      if (latest) {
        latestGmpByIpoId.set(ipo.id, Number(latest.gmp));
      }
    }
  }

  let fired = 0;
  let failed = 0;
  const firedIds: string[] = [];
  const undeliveredIds: string[] = [];
  const MAX_DELIVERY_ATTEMPTS = 5; // give up (mark fired) after this many failures

  for (const alert of alerts) {
    try {
      const ipo = alert.ipoSlug ? ipoBySlug.get(alert.ipoSlug) : null;

      // If no IPO found for a slug-based alert, skip gracefully
      if (!ipo && alert.type !== "gmp_threshold") {
        // For non-GMP alerts that have no ipoSlug set, skip silently
        continue;
      }
      if (alert.ipoSlug && !ipo) {
        // Stale slug — IPO deleted or slug changed. Skip silently.
        continue;
      }

      let conditionMet = false;
      let gmpValueForEmail: number | undefined;

      switch (alert.type) {
        case "gmp_threshold": {
          if (!ipo) break;
          const currentGmp = latestGmpByIpoId.get(ipo.id);
          if (currentGmp != null && alert.threshold != null) {
            conditionMet = currentGmp >= alert.threshold;
            gmpValueForEmail = currentGmp;
          }
          break;
        }
        case "subscription_open":
          conditionMet = ipo != null && isAroundToday(ipo.openDate ?? null);
          break;
        case "subscription_close":
          conditionMet = ipo != null && isAroundToday(ipo.closeDate ?? null);
          break;
        case "allotment":
          conditionMet = ipo != null && isAroundToday(ipo.allotmentDate ?? null);
          break;
        case "listing":
          conditionMet = ipo != null && isAroundToday(ipo.listingDate ?? null);
          break;
        default:
          break;
      }

      if (!conditionMet) continue;

      // Condition met — attempt email, then mark fired regardless
      const ipoName = ipo?.name ?? alert.ipoName;
      const conditionLine = describeCondition(alert.type, alert.threshold ?? null, gmpValueForEmail);

      // Only mark an alert fired once the email is actually DELIVERED (audit HIGH:
      // it previously marked firedAt even with no API key / on send failure, so
      // notifications were silently dropped forever). Undelivered alerts retry,
      // capped by attemptCount so a permanently-bad address can't loop forever.
      let delivered = false;
      if (resend) {
        const html = buildEmailHtml({
          userName: alert.user.name ?? "",
          ipoName,
          alertType: alert.type,
          conditionLine,
        });

        try {
          await resend.emails.send({
            from: FROM_ADDR,
            to: alert.user.email,
            subject: buildSubject(ipoName, conditionLine),
            html,
            headers: {
              "List-Unsubscribe": `<https://ipopulse.talkytools.com/my/alerts>`,
            },
          });
          delivered = true;
        } catch {
          delivered = false;
        }
      }

      if (delivered) {
        firedIds.push(alert.id);
        fired++;
      } else {
        undeliveredIds.push(alert.id);
      }
    } catch {
      failed++;
    }
  }

  // Bulk-mark delivered alerts as fired
  if (firedIds.length > 0) {
    await prisma.alert.updateMany({
      where: { id: { in: firedIds } },
      data: { firedAt: new Date() },
    });
  }
  // Undelivered: bump attempt count; give up (mark fired) once the cap is hit
  if (undeliveredIds.length > 0) {
    await prisma.alert.updateMany({
      where: { id: { in: undeliveredIds } },
      data: { attemptCount: { increment: 1 } },
    });
    await prisma.alert.updateMany({
      where: { id: { in: undeliveredIds }, attemptCount: { gte: MAX_DELIVERY_ATTEMPTS } },
      data: { firedAt: new Date() },
    });
  }

  const notes = apiKey
    ? `check_alerts: fired=${fired} failed=${failed} total_checked=${alerts.length}`
    : `check_alerts: RESEND_API_KEY missing — alerts marked fired without email. fired=${fired} total_checked=${alerts.length}`;

  return { rowsIn: fired, rowsError: failed, notes };
}
