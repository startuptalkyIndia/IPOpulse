/**
 * Per-user AI cost budget enforcement.
 * Default cap: ₹1,500 / user / month (AI_BUDGET_INR env var).
 *
 * IPOpulse uses Claude CLI (subscription billing). Rates are estimated
 * based on Claude Haiku 4.5 pay-per-token equivalent at ₹84/USD.
 *   Input:  $0.25 / 1M tokens  → ₹0.000021 / token
 *   Output: $1.25 / 1M tokens  → ₹0.000105 / token
 */

import { prisma } from "@/lib/db";

const MONTHLY_CAP_INR      = parseInt(process.env.AI_BUDGET_INR        ?? "1500",     10);
const INR_PER_INPUT_TOKEN  = parseFloat(process.env.AI_BUDGET_INR_INPUT ?? "0.000021");
const INR_PER_OUTPUT_TOKEN = parseFloat(process.env.AI_BUDGET_INR_OUTPUT ?? "0.000105");

function monthStart(): Date {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function estimateCostInr(inputTokens: number, outputTokens: number): number {
  return inputTokens * INR_PER_INPUT_TOKEN + outputTokens * INR_PER_OUTPUT_TOKEN;
}

export async function checkBudget(userId: string): Promise<{
  allowed: boolean;
  spentInr: number;
  remainingInr: number;
  capInr: number;
}> {
  const logs = await prisma.aiSpendLog.findMany({
    where: { userId, createdAt: { gte: monthStart() } },
    select: { costInr: true },
  });
  const spentInr = logs.reduce((s, l) => s + l.costInr, 0);
  const remainingInr = Math.max(0, MONTHLY_CAP_INR - spentInr);
  return { allowed: spentInr < MONTHLY_CAP_INR, spentInr, remainingInr, capInr: MONTHLY_CAP_INR };
}

export function recordSpend(
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cliEstimated = true,
): void {
  // Fire-and-forget — never await in the AI call hot path
  prisma.aiSpendLog.create({
    data: {
      userId,
      model,
      inputTokens,
      outputTokens,
      costInr: estimateCostInr(inputTokens, outputTokens),
      cliEstimated,
    },
  }).catch(() => { /* non-blocking */ });
}

export async function getMonthlyUsage(userId: string): Promise<{
  spentInr: number;
  remainingInr: number;
  capInr: number;
  callCount: number;
}> {
  const logs = await prisma.aiSpendLog.findMany({
    where: { userId, createdAt: { gte: monthStart() } },
    select: { costInr: true },
  });
  const spentInr = logs.reduce((s, l) => s + l.costInr, 0);
  return {
    spentInr,
    remainingInr: Math.max(0, MONTHLY_CAP_INR - spentInr),
    capInr: MONTHLY_CAP_INR,
    callCount: logs.length,
  };
}
