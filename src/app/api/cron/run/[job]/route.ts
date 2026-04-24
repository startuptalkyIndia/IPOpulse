import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { availableJobs } from "@/crons/scheduler";
import { runIngestion } from "@/crons/runIngestion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { job } = await params;
  const fn = availableJobs[job];
  if (!fn) return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 404 });

  const result = await runIngestion(job, fn);
  return NextResponse.json(result);
}
