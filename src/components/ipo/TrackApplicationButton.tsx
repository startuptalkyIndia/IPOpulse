"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, X } from "lucide-react";

interface Props {
  ipoId: number;
  ipoName: string;
  initial?: boolean;
  authed?: boolean;
}

export function TrackApplicationButton({ ipoId, ipoName, initial = false, authed = true }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tracked, setTracked] = useState(initial);
  const [lots, setLots] = useState(1);
  const [appNum, setAppNum] = useState("");
  const [category, setCategory] = useState("retail");
  const [pending, setPending] = useState(false);

  function go() {
    if (!authed) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setOpen(true);
  }

  async function save() {
    setPending(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipoId, lotsApplied: lots, applicationNumber: appNum, category }),
    });
    setPending(false);
    if (res.ok) {
      setTracked(true);
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={go}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
          tracked
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
        }`}
      >
        <ClipboardList className="w-3.5 h-3.5" />
        {tracked ? "Tracked" : "Track Application"}
      </button>

      {open ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Track your application</h3>
            <p className="text-xs text-gray-500 mb-4">{ipoName}</p>
            <div className="space-y-3">
              <div>
                <label className="label">Lots applied</label>
                <input type="number" min={1} className="input w-full" value={lots} onChange={(e) => setLots(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="retail">Retail</option>
                  <option value="hni">HNI</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="label">Application number (optional)</label>
                <input type="text" className="input w-full" value={appNum} onChange={(e) => setAppNum(e.target.value)} />
              </div>
              <button onClick={save} className="btn-primary w-full" disabled={pending}>
                {pending ? "Saving..." : "Save to my applications"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
