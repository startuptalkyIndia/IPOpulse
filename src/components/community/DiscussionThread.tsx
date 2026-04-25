import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CommentForm } from "./CommentForm";
import { CommentItem, type CommentNode } from "./CommentItem";
import { MessageCircle } from "lucide-react";

interface Props {
  targetType: "ipo" | "stock";
  targetSlug: string;
}

export async function DiscussionThread({ targetType, targetSlug }: Props) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin" || role === "superadmin";

  const comments = await prisma.comment.findMany({
    where: { targetType, targetSlug, hidden: false },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    take: 100,
  });

  // Pull my votes for these comments
  const myVotes = userId
    ? await prisma.commentVote.findMany({
        where: { userId, commentId: { in: comments.map((c) => c.id) } },
        select: { commentId: true, value: true },
      })
    : [];
  const voteMap = new Map(myVotes.map((v) => [v.commentId, v.value as 1 | -1]));

  // Pull author stats
  const authorIds = Array.from(new Set(comments.map((c) => c.userId)));
  const apps = await prisma.ipoApplication.groupBy({
    by: ["userId", "status"],
    where: { userId: { in: authorIds } },
    _count: true,
  });
  const statsByUser = new Map<string, { applied: number; allotted: number }>();
  for (const a of apps) {
    const s = statsByUser.get(a.userId) ?? { applied: 0, allotted: 0 };
    s.applied += a._count;
    if (a.status === "allotted") s.allotted += a._count;
    statsByUser.set(a.userId, s);
  }

  function toNode(c: typeof comments[number]): CommentNode {
    const stats = statsByUser.get(c.userId) ?? { applied: 0, allotted: 0 };
    const successPct = stats.applied > 0 ? Math.round((stats.allotted / stats.applied) * 100) : null;
    const authorName = c.user.name?.trim() || (c.user.email?.split("@")[0] ?? "anonymous");
    return {
      id: c.id,
      body: c.body,
      score: c.score,
      createdAt: c.createdAt.toISOString(),
      authorName,
      authorAppliedCount: stats.applied,
      authorAllottedCount: stats.allotted,
      authorSuccessPct: successPct,
      isOwn: c.userId === userId,
      isAdmin,
      myVote: (voteMap.get(c.id) ?? 0) as 1 | -1 | 0,
      replies: [],
    };
  }

  const byId = new Map<number, CommentNode>();
  for (const c of comments) byId.set(c.id, toNode(c));
  const top: CommentNode[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies.push(node);
    } else {
      top.push(node);
    }
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-indigo-600" /> Community discussion
        <span className="text-xs text-gray-500 font-normal">({comments.length})</span>
      </h2>

      <div className="mb-4">
        <CommentForm targetType={targetType} targetSlug={targetSlug} authed={!!userId} />
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No comments yet — be the first to share your view.</p>
      ) : (
        <div className="space-y-3">
          {top.map((node) => (
            <CommentItem key={node.id} node={node} targetType={targetType} targetSlug={targetSlug} authed={!!userId} />
          ))}
        </div>
      )}
    </div>
  );
}
