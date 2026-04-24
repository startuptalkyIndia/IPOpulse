import { prisma } from "@/lib/db";

export interface IngestionResult {
  rowsIn: number;
  rowsError?: number;
  notes?: string;
}

/**
 * Wraps a job function with start/finish logging + error capture against
 * the ingestion_runs table.
 */
export async function runIngestion(
  jobName: string,
  fn: () => Promise<IngestionResult>,
): Promise<{ ok: boolean; runId: number; error?: string } & Partial<IngestionResult>> {
  const run = await prisma.ingestionRun.create({
    data: { jobName, status: "running" },
  });

  try {
    const result = await fn();
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "success",
        rowsIn: result.rowsIn,
        rowsError: result.rowsError ?? 0,
        notes: result.notes,
      },
    });
    return { ok: true, runId: run.id, ...result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "failed",
        errorMsg: msg,
      },
    });
    return { ok: false, runId: run.id, error: msg };
  }
}
