import { prisma } from "@/lib/db";
import { maybePingSitemap } from "@/lib/seo-ping";

export interface IngestionResult {
  rowsIn: number;
  rowsError?: number;
  notes?: string;
  /**
   * Explicit outcome. Omit for the default (success, or failed when every row
   * errored, or partial when some rows errored).
   *  - "skipped": the job could not do its work for a known, configured-off
   *    reason (e.g. email not configured). NEVER recorded as success.
   *  - "partial": some rows failed, some worked.
   *  - "failed": the job failed; `notes` is stored as the error message.
   */
  status?: "success" | "partial" | "skipped" | "failed";
}

export type RunStatus = "success" | "partial" | "skipped" | "failed";

/** Pure status resolution so it can be unit-tested without a DB. */
export function resolveRunStatus(result: IngestionResult): RunStatus {
  const rowsError = result.rowsError ?? 0;
  if (result.status === "skipped" || result.status === "failed") return result.status;
  // M38: all rows errored = failure, even if the job did not say so.
  if (result.rowsIn === 0 && rowsError > 0) return "failed";
  if (result.status === "partial") return "partial";
  if (rowsError > 0) return "partial";
  return "success";
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
    const status = resolveRunStatus(result);
    const allErrored = status === "failed";
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status,
        rowsIn: result.rowsIn,
        rowsError,
        notes: result.notes,
        errorMsg: allErrored
          ? result.status === "failed" && result.notes
            ? result.notes
            : `all ${rowsError} rows errored`
          : undefined,
      },
    });
    // Best-effort: ping search engines after a successful content-bearing ingestion.
    // Internal throttle keeps this to at most 1 ping per hour.
    if (status !== "failed" && status !== "skipped" && result.rowsIn >= 1) {
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
