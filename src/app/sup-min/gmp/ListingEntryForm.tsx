"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { saveListingEntry } from "./actions";

interface IpoItem {
  id: number;
  name: string;
  slug: string;
  issuePrice: number | null;
  listingDate: string | null;
}

interface Props {
  ipos: IpoItem[];
}

export function ListingEntryForm({ ipos }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<number>(ipos[0]?.id ?? 0);

  const selected = ipos.find((i) => i.id === selectedId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus(null);
    startTransition(async () => {
      const res = await saveListingEntry(fd);
      if (res.ok) {
        setStatus({ ok: true, msg: "Listing price saved ✓" });
        formRef.current?.reset();
      } else {
        setStatus({ ok: false, msg: res.error ?? "Error saving" });
      }
    });
  }

  return (
    <div className="card">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="ipoId" value={selectedId} />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">IPO</label>
          <select
            className="input w-full"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {ipos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}{i.listingDate ? ` — listed ${new Date(i.listingDate).toLocaleDateString("en-IN")}` : ""}
              </option>
            ))}
          </select>
          {selected?.issuePrice && (
            <p className="text-xs text-gray-500 mt-1">Issue price: ₹{selected.issuePrice}</p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Listing price* <span className="text-gray-400">(open)</span>
            </label>
            <input
              name="listingPrice"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 245"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Day high</label>
            <input name="dayHigh" type="number" step="0.01" min="0" placeholder="optional" className="input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Day low</label>
            <input name="dayLow" type="number" step="0.01" min="0" placeholder="optional" className="input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Day close</label>
            <input name="dayClose" type="number" step="0.01" min="0" placeholder="optional" className="input w-full" />
          </div>
        </div>

        {selected?.issuePrice && (
          <p className="text-xs text-indigo-600">
            Listing gain will be auto-calculated vs issue price ₹{selected.issuePrice}.
            Last GMP entry will be captured as gmpAtListing for the accuracy scorecard.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Saving…" : "Save listing data"}
          </button>
          {status && (
            <span className={`inline-flex items-center gap-1 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
              {status.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
