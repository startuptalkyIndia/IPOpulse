export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(Math.round(n));
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
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
