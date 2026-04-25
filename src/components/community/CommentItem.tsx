"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, MessageSquare, Trash2 } from "lucide-react";
import { CommentForm } from "./CommentForm";

export interface CommentNode {
  id: number;
  body: string;
  score: number;
  createdAt: string;
  authorName: string;
  authorAppliedCount: number;
  authorAllottedCount: number;
  authorSuccessPct: number | null;
  isOwn: boolean;
  isAdmin: boolean;
  myVote: 1 | -1 | 0;
  replies: CommentNode[];
}

interface Props {
  node: CommentNode;
  targetType: "ipo" | "stock";
  targetSlug: string;
  authed: boolean;
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function CommentItem({ node, targetType, targetSlug, authed }: Props) {
  const router = useRouter();
  const [score, setScore] = useState(node.score);
  const [myVote, setMyVote] = useState(node.myVote);
  const [showReply, setShowReply] = useState(false);
  const [pending, start] = useTransition();

  async function vote(value: 1 | -1) {
    if (!authed) {
      router.push("/signin");
      return;
    }
    const next = myVote === value ? 0 : value;
    const delta = next - myVote;
    setScore(score + delta);
    setMyVote(next);
    start(async () => {
      await fetch(`/api/comments/${node.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
    });
  }

  async function del() {
    if (!confirm("Delete this comment?")) return;
    start(async () => {
      const res = await fetch(`/api/comments?id=${node.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="border-l-2 border-gray-200 pl-3 py-2">
      <div className="flex items-baseline gap-2 text-xs mb-1">
        <span className="font-semibold text-gray-900">{node.authorName}</span>
        {node.authorAppliedCount > 0 ? (
          <span className="badge bg-indigo-50 text-indigo-700 text-[10px]">
            {node.authorAppliedCount} IPOs · {node.authorSuccessPct != null ? `${node.authorSuccessPct}% allotted` : "—"}
          </span>
        ) : null}
        <span className="text-gray-400">· {timeAgo(node.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2 leading-relaxed">{node.body}</p>
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => vote(1)}
          disabled={pending}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-gray-100 ${myVote === 1 ? "text-indigo-600" : "text-gray-500"}`}
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-gray-700 tabular-nums w-6 text-center">{score}</span>
        <button
          onClick={() => vote(-1)}
          disabled={pending}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-gray-100 ${myVote === -1 ? "text-red-600" : "text-gray-500"}`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowReply(!showReply)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-gray-500 hover:bg-gray-100"
        >
          <MessageSquare className="w-3 h-3" /> Reply
        </button>
        {(node.isOwn || node.isAdmin) ? (
          <button
            onClick={del}
            disabled={pending}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        ) : null}
      </div>

      {showReply ? (
        <div className="mt-2">
          <CommentForm
            targetType={targetType}
            targetSlug={targetSlug}
            authed={authed}
            parentId={node.id}
            placeholder="Write a reply..."
            onPosted={() => setShowReply(false)}
          />
        </div>
      ) : null}

      {node.replies.length > 0 ? (
        <div className="mt-2 ml-4 space-y-2">
          {node.replies.map((r) => (
            <CommentItem key={r.id} node={r} targetType={targetType} targetSlug={targetSlug} authed={authed} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
