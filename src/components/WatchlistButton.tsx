"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  type: "ipo" | "stock";
  targetSlug: string;
  initial?: boolean;
  authed?: boolean;
}

export function WatchlistButton({ type, targetSlug, initial = false, authed = true }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();

  async function toggle() {
    if (!authed) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    start(async () => {
      if (saved) {
        await fetch(`/api/watchlist?type=${type}&targetSlug=${encodeURIComponent(targetSlug)}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch(`/api/watchlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, targetSlug }),
        });
        setSaved(true);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        saved ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
      } disabled:opacity-50`}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
    >
      {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
