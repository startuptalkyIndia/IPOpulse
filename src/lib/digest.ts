import type { FiiDiiDaily, Ipo } from "@prisma/client";

interface Args {
  liveIpos: Ipo[];
  upcomingIpos: Ipo[];
  todayFiiDii: FiiDiiDaily | null;
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return "TBA";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(d);
}

export function renderDigestHtml({ liveIpos, upcomingIpos, todayFiiDii }: Args): string {
  const fiiNet = todayFiiDii?.fiiNet ? Number(todayFiiDii.fiiNet) : null;
  const diiNet = todayFiiDii?.diiNet ? Number(todayFiiDii.diiNet) : null;

  const iposList = [...liveIpos, ...upcomingIpos];
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>IPOpulse Daily Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f9fafb; margin:0; padding:24px;">
  <div style="max-width:640px; margin:0 auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
      <div style="width:32px; height:32px; background:#4f46e5; border-radius:6px; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">IP</div>
      <div style="font-size:18px; font-weight:700; color:#111827;">IPO<span style="color:#4f46e5;">pulse</span> Daily</div>
    </div>

    <h1 style="font-size:20px; margin:0 0 4px 0; color:#111827;">Today in Indian IPOs & markets</h1>
    <p style="font-size:12px; color:#6b7280; margin:0 0 24px 0;">${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>

    <div style="display:flex; gap:12px; margin-bottom:20px;">
      <div style="flex:1; background:#eef2ff; border-radius:8px; padding:12px;">
        <div style="font-size:11px; color:#4f46e5; font-weight:600;">FII net (today)</div>
        <div style="font-size:18px; font-weight:700; color:${fiiNet == null ? "#6b7280" : fiiNet >= 0 ? "#059669" : "#dc2626"};">
          ${fiiNet == null ? "—" : `₹${fiiNet.toFixed(0)} Cr`}
        </div>
      </div>
      <div style="flex:1; background:#eef2ff; border-radius:8px; padding:12px;">
        <div style="font-size:11px; color:#4f46e5; font-weight:600;">DII net (today)</div>
        <div style="font-size:18px; font-weight:700; color:${diiNet == null ? "#6b7280" : diiNet >= 0 ? "#059669" : "#dc2626"};">
          ${diiNet == null ? "—" : `₹${diiNet.toFixed(0)} Cr`}
        </div>
      </div>
    </div>

    <h2 style="font-size:14px; margin:20px 0 10px 0; color:#111827;">IPOs to watch</h2>
    ${iposList.length === 0 ? `<p style="font-size:13px; color:#6b7280;">No IPOs in the next window.</p>` : ""}
    ${iposList
      .map(
        (i) => `
      <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <a href="https://ipopulse.talkytools.com/ipo/${i.slug}" style="font-size:14px; font-weight:600; color:#4f46e5; text-decoration:none;">${i.name}</a>
          <span style="font-size:11px; color:#6b7280;">${i.status}</span>
        </div>
        <div style="font-size:12px; color:#6b7280; margin-top:4px;">
          ${fmtDate(i.openDate)} – ${fmtDate(i.closeDate)} · ₹${i.priceBandLow ?? "?"}–${i.priceBandHigh ?? "?"} · ${i.type === "sme" ? "SME" : "Mainboard"}
        </div>
      </div>
    `,
      )
      .join("")}

    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af;">
      <a href="https://ipopulse.talkytools.com" style="color:#4f46e5; text-decoration:none;">IPOpulse</a> — India's structured IPO &amp; market data hub.
      <br />You're getting this because you subscribed. <a href="https://ipopulse.talkytools.com/unsubscribe" style="color:#6b7280;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}
