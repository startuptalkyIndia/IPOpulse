export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encryptApiKey } from "@/lib/encrypt";
import { testApiKey, type AIProvider } from "@/lib/byok";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { provider, apiKey, model } = await req.json();
  if (!provider || !apiKey) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const test = await testApiKey(provider as AIProvider, apiKey);
  if (!test.valid) return NextResponse.json({ error: `Invalid key: ${test.error}` }, { status: 400 });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiProvider: provider, aiApiKey: encryptApiKey(apiKey), aiModel: model ?? test.model, aiKeyVerified: true, aiKeyAddedAt: new Date() },
  });
  return NextResponse.json({ success: true, model: model ?? test.model });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiProvider: null, aiApiKey: null, aiModel: null, aiKeyVerified: false, aiKeyAddedAt: null },
  });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { aiProvider: true, aiModel: true, aiKeyVerified: true, aiKeyAddedAt: true },
  });
  return NextResponse.json(user ?? {});
}
