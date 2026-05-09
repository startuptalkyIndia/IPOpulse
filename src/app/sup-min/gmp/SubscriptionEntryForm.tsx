"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { saveSubscriptionEntry } from "./actions";

interface IpoItem { id: number; name: string; status: string }

export function SubscriptionEntryForm({ ipos }: { ipos: IpoItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<number>(ipos[0]?.id ?? 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus(null);
    startTransition(async () => {
      const res = await saveSubscriptionEntry(fd);
      if (res.ok) {
        setStatus({ ok: true, msg: "Subscription saved ✓" });
        formRef.current?.reset();
        setSelectedId(ipos[0]?.id ?? 0);
      } else {
        setStatus({ ok: false, msg: res.error ?? "Error" });
      }
    });
  }

  if (!ipos.length) return null;

  return (
    <div className="card">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="ipoId" value={selectedId} />
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">IPO (live/upcoming)</label>
          <select className="input w-full" value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}>
            {ipos.map(i => <option key={i.id} value={i.id}>{i.name} ({i.status})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: "retailX", label: "Retail (x)" },
            { name: "hniX",    label: "HNI (x)" },
            { name: "qibX",    label: "QIB (x)" },
            { name: "employeeX", label: "Employee (x)" },
            { name: "totalX",  label: "Total (x)" },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
              <input name={f.name} type="number" step="0.01" min="0" placeholder="e.g. 2.5" className="input w-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Saving…" : "Save subscription"}
          </button>
          {status && (
            <span className={`inline-flex items-center gap-1 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
              {status.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.msg}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">Snapshot is timestamped now — enter subscription data from BSE/NSE website for live IPOs.</p>
      </form>
    </div>
  );
}
