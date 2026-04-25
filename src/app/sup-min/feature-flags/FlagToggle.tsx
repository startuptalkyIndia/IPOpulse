"use client";

import { useState, useTransition } from "react";

export function FlagToggle({ flagKey, initial }: { flagKey: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    start(async () => {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flagKey, enabled: next }),
      });
      if (!res.ok) {
        setError("Save failed");
        setEnabled(!next);
      } else {
        setError(null);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={pending}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {error ? <span className="text-[10px] text-red-600">{error}</span> : null}
    </div>
  );
}
