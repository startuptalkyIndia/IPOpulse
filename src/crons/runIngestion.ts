import { prisma } from "@/lib/db";
import { maybePingSitemap } from "@/lib/seo-ping";

export interface IngestionResult {
  rowsIn: number;
  rowsError?: number;
  notes?: string;
}

// In-process single-flight guard (audit MEDIUM M43): several jobs share a
// trigger and the manual /api/cron/run endpoint can fire a job already running.
// Overlapping heavy jobs stack RAM on the shared 16GB box and race on upserts.
const inFlight = new Set<string>();

/**
 * Wraps a job function with start/finish logging + error capture against
 * the ingestion_runs table.
 */
export async function runIngestion(
  jobName: string,
  fn: () => Promise<IngestionResult>,
): Promise<{ ok: boolean; runId: number; error?: string } & Partial<IngestionResult>> {
  if (inFlight.has(jobName)) {
    return { ok: true, runId: -1, rowsIn: 0, notes: `skipped — ${jobName} already running` };
  }
  inFlight.add(jobName);

  const run = await prisma.ingestionRun.create({
    data: { jobName, status: "running" },
  });

  try {
    const result = await fn();
    // Treat an all-errors run as a FAILURE (audit MEDIUM M38): jobs that swallow
    // per-row errors and return rowsIn:0 with rowsError>0 used to report "success",
    // hiding the breakage from the heartbeat's job-liveness check.
    const rowsError = result.rowsError ?? 0;
    const allErrored = result.rowsIn === 0 && rowsError > 0;
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: allErrored ? "failed" : "success",
        rowsIn: result.rowsIn,
        rowsError,
        notes: result.notes,
        errorMsg: allErrored ? `all ${rowsError} rows errored` : undefined,
      },
    });
    // Best-effort: ping search engines after a successful content-bearing ingestion.
    // Internal throttle keeps this to at most 1 ping per hour.
    if (!allErrored && result.rowsIn >= 1) {
      maybePingSitemap().catch(() => {});
    }
    return { ok: !allErrored, runId: run.id, ...result };
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
  } finally {
    inFlight.delete(jobName);
  }
}
