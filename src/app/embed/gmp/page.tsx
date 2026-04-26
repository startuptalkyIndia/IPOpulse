export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";

export const metadata = {
  robots: { index: false, follow: false },
};

interface IpoCard {
  slug: string;
  name: string;
  type: string;
  priceHigh: number | null;
  gmp: number | null;
  closeDate: Date | null;
  status: string;
}

export default async function GmpEmbed() {
  const ipos = await prisma.ipo.findMany({
    where: { status: { in: ["live", "upcoming"] } },
    orderBy: { closeDate: "asc" },
    take: 5,
    include: { gmpEntries: { orderBy: { date: "desc" }, take: 1 } },
  });

  const cards: IpoCard[] = ipos.map((i) => ({
    slug: i.slug,
    name: i.name,
    type: i.type,
    priceHigh: i.priceBandHigh ? Number(i.priceBandHigh) : null,
    gmp: i.gmpEntries[0]?.gmp ? Number(i.gmpEntries[0].gmp) : null,
    closeDate: i.closeDate,
    status: i.status,
  }));

  return (
    <html lang="en">
      <head>
        <title>IPO GMP Live · IPOpulse</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{font:14px/1.4 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:transparent;color:#111827;padding:8px}
          a{color:inherit;text-decoration:none}
          .wrap{max-width:560px;margin:0 auto}
          .head{display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid #e5e7eb;margin-bottom:8px}
          .brand{display:flex;align-items:center;gap:6px;font-weight:700;color:#4f46e5;font-size:13px}
          .brand .dot{width:18px;height:18px;background:#4f46e5;color:#fff;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800}
          .row{display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid #f3f4f6}
          .row:last-child{border:none}
          .name{flex:1;min-width:0}
          .name b{display:block;font-weight:600;font-size:13px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .name .meta{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.4px}
          .gmp{font-weight:700;font-size:14px;color:#4f46e5;font-variant-numeric:tabular-nums;text-align:right}
          .gmp .pct{display:block;font-weight:500;font-size:10px;color:#6b7280}
          .empty{text-align:center;color:#6b7280;padding:24px 8px;font-size:12px}
          .badge{display:inline-block;padding:1px 5px;border-radius:99px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
          .live{background:#dcfce7;color:#15803d}
          .up{background:#e0e7ff;color:#3730a3}
          .foot{padding-top:6px;text-align:center;font-size:10px;color:#9ca3af}
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <div className="head">
            <div className="brand"><span className="dot">IP</span> IPO GMP · Live</div>
            <a href="https://ipopulse.talkytools.com/ipo" target="_blank" style={{ fontSize: 11, color: "#6b7280" }}>
              View all →
            </a>
          </div>
          {cards.length === 0 ? (
            <div className="empty">No live IPOs right now.</div>
          ) : (
            cards.map((c) => {
              const pct = c.gmp != null && c.priceHigh ? ((c.gmp / c.priceHigh) * 100).toFixed(1) : null;
              return (
                <a key={c.slug} className="row" href={`https://ipopulse.talkytools.com/ipo/${c.slug}?utm_source=embed&utm_medium=widget`} target="_blank">
                  <div className="name">
                    <b>{c.name}</b>
                    <div className="meta">
                      <span className={`badge ${c.status === "live" ? "live" : "up"}`}>{c.status}</span>
                      &nbsp;{c.type === "sme" ? "SME" : "Mainboard"}
                    </div>
                  </div>
                  <div className="gmp">
                    {c.gmp != null ? `₹${c.gmp.toFixed(0)}` : "—"}
                    {pct ? <span className="pct">+{pct}%</span> : null}
                  </div>
                </a>
              );
            })
          )}
          <div className="foot">
            Powered by{" "}
            <a href="https://ipopulse.talkytools.com" target="_blank" style={{ color: "#4f46e5", fontWeight: 600 }}>
              IPOpulse
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
