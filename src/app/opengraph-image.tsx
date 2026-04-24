import { ImageResponse } from "next/og";

export const alt = "IPOpulse — India's IPO, Stock & Market Data Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #faf5ff 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "#4f46e5",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            IP
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#111827", display: "flex" }}>
            IPO<span style={{ color: "#4f46e5" }}>pulse</span>
          </div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, color: "#111827", lineHeight: 1.1, display: "flex", flexWrap: "wrap", maxWidth: 1000 }}>
          Every IPO, every stock, every number — in one clean dashboard.
        </div>
        <div style={{ fontSize: 26, color: "#4b5563", marginTop: 28, maxWidth: 1000, lineHeight: 1.4, display: "flex" }}>
          Live GMP · Allotment · 10-yr financials · Super Investor portfolios · 20 free calculators
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
          {["Mainboard", "SME IPO", "FII/DII", "Calculators", "Allotment"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 18px",
                background: "white",
                border: "1px solid #c7d2fe",
                color: "#4338ca",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
