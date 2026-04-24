import type { Ipo } from "@prisma/client";

export type IpoStatus = "upcoming" | "live" | "closed" | "listed" | "withdrawn";

export function computeIpoStatus(ipo: { openDate: Date | null; closeDate: Date | null; listingDate: Date | null; status: string }): IpoStatus {
  const now = new Date();
  if (ipo.status === "withdrawn") return "withdrawn";
  if (ipo.listingDate && now >= ipo.listingDate) return "listed";
  if (ipo.openDate && ipo.closeDate) {
    if (now < ipo.openDate) return "upcoming";
    if (now >= ipo.openDate && now <= ipo.closeDate) return "live";
    if (now > ipo.closeDate) return "closed";
  }
  return (ipo.status as IpoStatus) || "upcoming";
}

export function formatPriceBand(ipo: Pick<Ipo, "priceBandLow" | "priceBandHigh">): string {
  const lo = ipo.priceBandLow?.toString();
  const hi = ipo.priceBandHigh?.toString();
  if (!lo || !hi) return "TBA";
  if (lo === hi) return `₹${lo}`;
  return `₹${lo} – ₹${hi}`;
}

export function formatIssueSize(sizeCr: number | null | undefined): string {
  if (!sizeCr) return "—";
  if (sizeCr >= 100) return `₹${sizeCr.toFixed(0)} Cr`;
  return `₹${sizeCr.toFixed(2)} Cr`;
}

export function formatDateRange(open: Date | null, close: Date | null): string {
  if (!open || !close) return "TBA";
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
  const openStr = fmt.format(open);
  const closeStr = fmt.format(close);
  return `${openStr} – ${closeStr}`;
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "TBA";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function daysUntil(target: Date | null | undefined): number | null {
  if (!target) return null;
  const now = new Date();
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function statusLabel(status: IpoStatus): string {
  switch (status) {
    case "upcoming": return "Upcoming";
    case "live": return "Open";
    case "closed": return "Closed";
    case "listed": return "Listed";
    case "withdrawn": return "Withdrawn";
  }
}

export function statusBadgeClass(status: IpoStatus): string {
  switch (status) {
    case "upcoming": return "badge badge-info";
    case "live": return "badge bg-green-100 text-green-800";
    case "closed": return "badge badge-warning";
    case "listed": return "badge bg-purple-100 text-purple-800";
    case "withdrawn": return "badge badge-error";
  }
}
