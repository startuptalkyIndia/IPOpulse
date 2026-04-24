"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Check, X } from "lucide-react";

export function TriggerJobButton({ job }: { job: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"idle" | "ok" | "err">("idle");

  async function run() {
    setResult("idle");
    startTransition(async () => {
      const res = await fetch(`/api/cron/run/${job}`, { method: "POST" });
      if (res.ok) {
        setResult("ok");
        router.refresh();
      } else {
        setResult("err");
      }
      setTimeout(() => setResult("idle"), 3000);
    });
  }

  return (
    <button
      onClick={run}
      disabled={pending}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 ${
        result === "ok"
          ? "bg-green-100 text-green-800"
          : result === "err"
          ? "bg-red-100 text-red-800"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } disabled:opacity-50 transition-colors`}
    >
      {pending ? (
        "Running..."
      ) : result === "ok" ? (
        <>
          <Check className="w-3 h-3" /> Success
        </>
      ) : result === "err" ? (
        <>
          <X className="w-3 h-3" /> Failed
        </>
      ) : (
        <>
          <Play className="w-3 h-3" /> Run now
        </>
      )}
    </button>
  );
}
