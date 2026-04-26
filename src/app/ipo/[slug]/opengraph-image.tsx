import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "IPOpulse — IPO details with GMP, subscription, allotment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "TBA";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function OG({ params }: { params: { slug: string } }) {
  const ipo = await prisma.ipo.findUnique({
    where: { slug: params.slug },
    include: { gmpEntries: { orderBy: { date: "desc" }, take: 1 }, subscriptions: { orderBy: { capturedAt: "desc" }, take: 1 } },
  }).catch(() => null);

  if (!ipo) {
    // Fallback if IPO not found
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 800 }}>
          IPOpulse
        </div>
      ),
      { ...size },
    );
  }

  const gmp = ipo.gmpEntries[0]?.gmp ? Number(ipo.gmpEntries[0].gmp) : null;
  const sub = ipo.subscriptions[0]?.totalX ? Number(ipo.subscriptions[0].totalX) : null;
  const priceLow = ipo.priceBandLow ? Number(ipo.priceBandLow) : null;
  const priceHigh = ipo.priceBandHigh ? Number(ipo.priceBandHigh) : null;
  const expectedListingPct = gmp != null && priceHigh ? (gmp / priceHigh) * 100 : null;

  const status = ipo.status.toUpperCase();
  const statusColor =
    ipo.status === "live" ? "#16a34a" : ipo.status === "upcoming" ? "#4f46e5" : ipo.status === "closed" ? "#ca8a04" : "#7c3aed";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 60%, #faf5ff 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 60,
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        {/* Brand bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: "#4f46e5", borderRadius: 12, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800 }}>
            IP
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#111827" }}>
              IPO<span style={{ color: "#4f46e5" }}>pulse</span>
            </span>
            <span style={{ fontSize: 18, color: "#6b7280" }}>{ipo.type === "sme" ? "SME IPO" : "Mainboard IPO"}</span>
            <span style={{ fontSize: 14, fontWeight: 700, padding: "4px 12px", background: statusColor, color: "white", borderRadius: 99, marginLeft: 8 }}>
              {status}
            </span>
          </div>
        </div>

        {/* IPO name */}
        <div style={{ fontSize: 60, fontWeight: 800, color: "#111827", lineHeight: 1.1, maxWidth: 1080, display: "flex" }}>
          {ipo.name}
        </div>

        {/* Stat tiles */}
        <div style={{ display: "flex", gap: 20, marginTop: 36, flexWrap: "wrap" }}>
          {priceLow && priceHigh ? (
            <Tile label="Price band" value={priceLow === priceHigh ? `₹${priceLow}` : `₹${priceLow} – ${priceHigh}`} />
          ) : null}
          {ipo.lotSize ? <Tile label="Lot size" value={`${ipo.lotSize} shares`} /> : null}
          {ipo.issueSize ? <Tile label="Issue size" value={`₹${Number(ipo.issueSize).toFixed(0)} Cr`} /> : null}
          {gmp != null ? <Tile label="GMP" value={`₹${gmp.toFixed(0)}`} highlight /> : null}
          {sub != null ? <Tile label="Subscription" value={`${sub.toFixed(2)}×`} /> : null}
          {expectedListingPct != null ? (
            <Tile
              label="Expected gain"
              value={`${expectedListingPct >= 0 ? "+" : ""}${expectedListingPct.toFixed(1)}%`}
              positive={expectedListingPct >= 0}
            />
          ) : null}
        </div>

        {/* Dates strip */}
        {ipo.openDate || ipo.listingDate ? (
          <div style={{ display: "flex", gap: 32, marginTop: 28, fontSize: 22, color: "#374151" }}>
            {ipo.openDate ? <div>📅 Opens {fmtDate(ipo.openDate)}</div> : null}
            {ipo.closeDate ? <div>🔒 Closes {fmtDate(ipo.closeDate)}</div> : null}
            {ipo.listingDate ? <div>🚀 Lists {fmtDate(ipo.listingDate)}</div> : null}
          </div>
        ) : null}

        {/* Footer */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 18, fontSize: 18, color: "#6b7280" }}>
          <div style={{ display: "flex" }}>ipopulse.talkytools.com/ipo/{ipo.slug}</div>
          <div style={{ display: "flex" }}>Live GMP · Subscription · Allotment · Listing perf</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Tile({ label, value, highlight, positive }: { label: string; value: string; highlight?: boolean; positive?: boolean }) {
  const fg = highlight ? "#4f46e5" : positive == null ? "#111827" : positive ? "#16a34a" : "#dc2626";
  const bg = highlight ? "#eef2ff" : "#ffffff";
  return (
    <div style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 20px", display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 14, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 800, color: fg, marginTop: 2 }}>{value}</span>
    </div>
  );
}
