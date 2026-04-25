"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  targetType: "ipo" | "stock";
  targetSlug: string;
  authed: boolean;
  parentId?: number;
  onPosted?: () => void;
  placeholder?: string;
}

export function CommentForm({ targetType, targetSlug, authed, parentId, onPosted, placeholder }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetSlug, body, parentId }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? "Failed to post");
        return;
      }
      setBody("");
      onPosted?.();
      router.refresh();
    });
  }

  if (!authed) {
    return (
      <div className="card text-center py-6 bg-gray-50">
        <p className="text-sm text-gray-600 mb-2">Sign in to join the discussion.</p>
        <Link
          href={`/signin?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
          className="btn-primary inline-flex items-center"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        className="input w-full resize-none"
        rows={parentId ? 2 : 3}
        placeholder={placeholder ?? "Share your view... (max 800 chars, no promo links)"}
        maxLength={800}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">{body.length}/800</span>
        {error ? <span className="text-xs text-red-600 flex-1">{error}</span> : null}
        <button
          type="submit"
          className="btn-primary text-xs"
          disabled={pending || body.trim().length < 2}
        >
          {pending ? "Posting..." : parentId ? "Reply" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
