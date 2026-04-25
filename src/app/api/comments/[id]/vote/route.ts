import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const vote = Number(body.value);
  if (vote !== 1 && vote !== -1 && vote !== 0) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const existing = await prisma.commentVote.findUnique({ where: { userId_commentId: { userId, commentId } } });

  let scoreDelta = 0;
  if (vote === 0 && existing) {
    scoreDelta = -existing.value;
    await prisma.commentVote.delete({ where: { id: existing.id } });
  } else if (existing) {
    scoreDelta = vote - existing.value;
    await prisma.commentVote.update({ where: { id: existing.id }, data: { value: vote } });
  } else if (vote !== 0) {
    scoreDelta = vote;
    await prisma.commentVote.create({ data: { userId, commentId, value: vote } });
  }

  if (scoreDelta !== 0) {
    await prisma.comment.update({ where: { id: commentId }, data: { score: { increment: scoreDelta } } });
  }

  const updated = await prisma.comment.findUnique({ where: { id: commentId }, select: { score: true } });
  return NextResponse.json({ ok: true, score: updated?.score ?? 0, vote });
}
