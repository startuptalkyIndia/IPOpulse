"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Ban } from "lucide-react";

export function ModerationActions({
  commentId,
  userId,
  userBanned,
}: {
  commentId: number;
  userId: string;
  userBanned: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function del() {
    if (!confirm("Delete this comment?")) return;
    start(async () => {
      await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      router.refresh();
    });
  }

  async function toggleBan() {
    if (!confirm(userBanned ? "Unban this user?" : "Ban this user from posting?")) return;
    start(async () => {
      await fetch(`/api/admin/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !userBanned }),
      });
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={del}
        disabled={pending}
        className="text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-0.5"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
      <button
        onClick={toggleBan}
        disabled={pending}
        className={`text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-0.5 disabled:opacity-50 ${
          userBanned ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
        }`}
      >
        <Ban className="w-3 h-3" /> {userBanned ? "Unban" : "Ban"}
      </button>
    </div>
  );
}
