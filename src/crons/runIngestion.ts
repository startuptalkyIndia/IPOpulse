import { prisma } from "@/lib/db";
import { maybePingSitemap } from "@/lib/seo-ping";

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
    // Best-effort: ping search engines after a successful content-bearing ingestion.
    // Internal throttle keeps this to at most 1 ping per hour.
    if (result.rowsIn >= 1) {
      maybePingSitemap().catch(() => {});
    }
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
