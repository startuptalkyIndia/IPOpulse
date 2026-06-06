"use client";

/**
 * /account/privacy — DPDP Act 2023 §12 data-rights page (IPOpulse).
 */

import { useState } from "react";
import Link from "next/link";

export default function PrivacyRightsPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExport() {
    setExportLoading(true);
    setExportError(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setExportError((body as { error?: string }).error ?? "Export failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? "ipopulse-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDelete() {
    if (confirmText !== "delete my account") {
      setDeleteError("Type 'delete my account' exactly.");
      return;
    }
    setDeleteStep("loading");
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteStep("confirm");
        setDeleteError((body as { error?: string }).error ?? "Deletion failed.");
        return;
      }
      setDeleteStep("done");
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } catch {
      setDeleteStep("confirm");
      setDeleteError("Network error. Try again.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
        Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Your data rights</h1>
      <p className="mt-2 text-sm text-slate-500">Digital Personal Data Protection Act 2023 (India), Section 12.</p>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Download my data</h2>
        <p className="mt-1 text-sm text-slate-600">Account, watchlist, IPO applications, and AI usage history as JSON.</p>
        <button onClick={handleExport} disabled={exportLoading}
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {exportLoading ? "Preparing..." : "Download my data"}
        </button>
        {exportError && <p className="mt-2 text-sm text-red-600">{exportError}</p>}
      </section>

      <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Delete my account</h2>
        <p className="mt-1 text-sm text-red-700">Permanently removes your personal information. Your watchlist and application history are anonymised, not erased, for audit continuity.</p>

        {deleteStep === "idle" && (
          <button onClick={() => setDeleteStep("confirm")}
            className="mt-4 inline-flex items-center rounded-lg border border-red-400 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
            Request deletion
          </button>
        )}
        {deleteStep === "confirm" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-red-800">
              Type <span className="rounded bg-red-100 px-1 font-mono">delete my account</span> to confirm:
            </p>
            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
              placeholder="delete my account"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={confirmText !== "delete my account"}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                Permanently delete
              </button>
              <button onClick={() => { setDeleteStep("idle"); setConfirmText(""); setDeleteError(null); }}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}
        {deleteStep === "loading" && <p className="mt-4 text-sm text-red-700">Deleting...</p>}
        {deleteStep === "done" && <p className="mt-4 text-sm font-medium text-red-800">Account deleted. Redirecting.</p>}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">DPDP Act 2023 rights</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li><strong>Right to access (§11):</strong> Download your data above.</li>
          <li><strong>Right to erasure (§12):</strong> Delete your account above.</li>
          <li><strong>Right to grievance redressal (§13):</strong> Contact our Grievance Officer.</li>
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          <strong>Grievance Officer:</strong> Shubham Kumar, TalkyTools —{" "}
          <a href="mailto:privacy@talkytools.com" className="text-indigo-600 hover:underline">privacy@talkytools.com</a>.
          We respond within 30 days.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <Link href="/privacy" className="text-indigo-600 hover:underline">Full Privacy Policy</Link>
        </p>
      </section>
    </main>
  );
}
