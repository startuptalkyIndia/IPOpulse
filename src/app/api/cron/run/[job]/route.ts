import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { availableJobs } from "@/crons/scheduler";
import { runIngestion } from "@/crons/runIngestion";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  // Cron triggers are admin-only — any logged-in user must NOT be allowed
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { job } = await params;
  // Whitelist-only: reject any job name not registered in availableJobs
  const fn = availableJobs[job];
  if (!fn) return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 404 });

  const result = await runIngestion(job, fn);
  return NextResponse.json(result);
}
