"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react";

interface Props {
  ipoId: number;
  authed: boolean;
  initialMyVote: "subscribe" | "avoid" | "watching" | null;
  initialTally: { subscribe: number; avoid: number; watching: number };
}

const choices: Array<{ key: "subscribe" | "avoid" | "watching"; label: string; icon: typeof ThumbsUp; cls: string }> = [
  { key: "subscribe", label: "Will Subscribe", icon: ThumbsUp, cls: "bg-green-100 text-green-800 border-green-300" },
  { key: "avoid", label: "Will Avoid", icon: ThumbsDown, cls: "bg-red-100 text-red-800 border-red-300" },
  { key: "watching", label: "Watching", icon: Eye, cls: "bg-yellow-100 text-yellow-800 border-yellow-300" },
];

export function IpoPoll({ ipoId, authed, initialMyVote, initialTally }: Props) {
  const router = useRouter();
  const [myVote, setMyVote] = useState(initialMyVote);
  const [tally, setTally] = useState(initialTally);
  const [pending, start] = useTransition();

  async function vote(choice: "subscribe" | "avoid" | "watching") {
    if (!authed) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (pending) return;
    start(async () => {
      const newTally = { ...tally };
      if (myVote && myVote !== choice) newTally[myVote] = Math.max(0, newTally[myVote] - 1);
      if (myVote !== choice) newTally[choice]++;
      setTally(newTally);
      setMyVote(choice);
      await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipoId, vote: choice }),
      });
      router.refresh();
    });
  }

  const total = tally.subscribe + tally.avoid + tally.watching;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Community sentiment</h3>
        <span className="text-xs text-gray-500">{total} {total === 1 ? "vote" : "votes"}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {choices.map((c) => {
          const Icon = c.icon;
          const selected = myVote === c.key;
          return (
            <button
              key={c.key}
              onClick={() => vote(c.key)}
              disabled={pending}
              className={`text-xs font-medium px-2 py-2 rounded-lg border transition-colors ${
                selected ? c.cls : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              } disabled:opacity-50`}
            >
              <Icon className="w-3.5 h-3.5 inline mr-1" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Tally bar */}
      {total > 0 ? (
        <div className="space-y-1.5">
          {choices.map((c) => {
            const v = tally[c.key];
            const pct = total > 0 ? (v / total) * 100 : 0;
            const barColor = c.key === "subscribe" ? "bg-green-500" : c.key === "avoid" ? "bg-red-500" : "bg-yellow-500";
            return (
              <div key={c.key} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 w-20">{c.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-700 tabular-nums w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-2">Be the first to vote.</p>
      )}
    </div>
  );
}
