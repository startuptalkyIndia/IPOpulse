"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdvisorAdminActions({ advisorId, status }: { advisorId: number; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function update(newStatus: string) {
    if (!confirm(`Set status to ${newStatus}?`)) return;
    start(async () => {
      await fetch("/api/admin/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId, status: newStatus }),
      });
      router.refresh();
    });
  }

  if (status === "pending") {
    return (
      <div className="inline-flex gap-1">
        <button onClick={() => update("approved")} disabled={pending} className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50">Approve</button>
        <button onClick={() => update("rejected")} disabled={pending} className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50">Reject</button>
      </div>
    );
  }
  if (status === "approved") {
    return <button onClick={() => update("suspended")} disabled={pending} className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50">Suspend</button>;
  }
  if (status === "suspended") {
    return <button onClick={() => update("approved")} disabled={pending} className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50">Reinstate</button>;
  }
  if (status === "rejected") {
    return <button onClick={() => update("approved")} disabled={pending} className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50">Approve</button>;
  }
  return null;
}
