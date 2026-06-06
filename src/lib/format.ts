export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(Math.round(n));
  if (abs >= 1e12) return `₹${(n / 1e12).toFixed(2)} L Cr`;        // lakh crore
  if (abs >= 1e7) {
    const cr = n / 1e7;
    // Large crore values: no decimals + Indian thousands separators
    return cr >= 1000
      ? `₹${Math.round(cr).toLocaleString("en-IN")} Cr`
      : `₹${cr.toFixed(2)} Cr`;
  }
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function formatCurrencyFull(n: number): string {
  if (!isFinite(n)) return "—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function formatPlain(n: number): string {
  return n.toLocaleString("en-IN");
}

export function formatByType(n: number, type: "currency" | "percent" | "plain"): string {
  if (type === "currency") return formatCurrency(n);
  if (type === "percent") return formatPercent(n);
  return formatPlain(n);
}
