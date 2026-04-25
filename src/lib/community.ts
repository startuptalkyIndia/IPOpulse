/**
 * Community helpers — rate limiting, profanity filter, validation.
 */

import { prisma } from "./db";

const BANNED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard",
  "chutiya", "madarchod", "behenchod", "bhosdike",
  "scam", "fraud", // surface these in moderation queue, not auto-block
];

export interface CommentValidation {
  ok: boolean;
  error?: string;
  flagged?: string[];
}

export function validateCommentBody(body: string): CommentValidation {
  const trimmed = body.trim();
  if (trimmed.length < 2) return { ok: false, error: "Comment too short" };
  if (trimmed.length > 800) return { ok: false, error: "Comment must be 800 characters or fewer" };
  if (/(https?:\/\/[^\s]{30,}|t\.me\/|whatsapp\.com\/)/i.test(trimmed)) {
    return { ok: false, error: "Promotional links are not allowed" };
  }
  const lower = trimmed.toLowerCase();
  const flagged = BANNED_WORDS.filter((w) => lower.includes(w));
  if (flagged.length > 0 && flagged.some((f) => ["fuck", "shit", "bitch", "asshole", "chutiya", "madarchod", "behenchod", "bhosdike"].includes(f))) {
    return { ok: false, error: "Please keep comments respectful" };
  }
  return { ok: true, flagged: flagged.length > 0 ? flagged : undefined };
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 1; // 1 comment per minute per user

export async function checkRateLimit(userId: string): Promise<{ ok: boolean; nextAllowedInMs?: number }> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.comment.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT_MAX) {
    const last = await prisma.comment.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const elapsed = last ? Date.now() - last.createdAt.getTime() : RATE_LIMIT_WINDOW_MS;
    return { ok: false, nextAllowedInMs: Math.max(0, RATE_LIMIT_WINDOW_MS - elapsed) };
  }
  return { ok: true };
}

export async function userBadgeStats(userId: string) {
  const apps = await prisma.ipoApplication.findMany({
    where: { userId },
    select: { status: true },
  });
  const total = apps.length;
  const allotted = apps.filter((a) => a.status === "allotted").length;
  return {
    appliedCount: total,
    allottedCount: allotted,
    successRate: total > 0 ? Math.round((allotted / total) * 100) : null,
  };
}
