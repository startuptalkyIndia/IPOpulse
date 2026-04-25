import { prisma } from "./db";

/**
 * Generate a short, human-readable referral code (e.g., "AKSH7K2").
 */
export function generateRefCode(name?: string | null): string {
  const seed = (name ?? "ADV").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "ADV";
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${seed}${suffix}`;
}

export async function getAdvisorByUserId(userId: string) {
  return prisma.advisor.findUnique({ where: { userId } });
}

export async function getAdvisorByRefCode(refCode: string) {
  return prisma.advisor.findUnique({ where: { refCode } });
}

/**
 * Append ?adv=CODE to a URL safely (preserves existing query string).
 */
export function withAdvisorRef(url: string, refCode: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}adv=${encodeURIComponent(refCode)}`;
}
