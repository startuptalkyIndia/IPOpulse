import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { availableJobs } from "@/crons/scheduler";
import { runIngestion } from "@/crons/runIngestion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  // Allow either admin session OR a shared CRON_SECRET header (for server-side curl triggers)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const secretOk = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!secretOk) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { job } = await params;
  // Whitelist-only: reject any job name not registered in availableJobs
  const fn = availableJobs[job];
  if (!fn) return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 404 });

  const result = await runIngestion(job, fn);
  return NextResponse.json(result);
}
