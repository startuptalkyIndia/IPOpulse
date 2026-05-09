"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveIpoEntry } from "./actions";

export function IpoEntryForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveIpoEntry(formData);
      if (res.ok) {
        setMsg({ kind: "success", text: `IPO saved. Slug: ${res.slug}` });
        router.push("/sup-min/ipos");
      } else {
        setMsg({ kind: "error", text: res.error ?? "Save failed" });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            msg.kind === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Basic Info */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Basic Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Tata Technologies Ltd"
            className="input w-full"
          />
          <p className="text-xs text-gray-400 mt-1">
            Slug is auto-generated. Re-submitting same name updates the existing record.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" className="input w-full">
              <option value="mainboard">Mainboard</option>
              <option value="sme">SME</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" defaultValue="upcoming" className="input w-full">
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
              <option value="listed">Listed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Pricing
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Band Low (₹)
            </label>
            <input name="priceBandLow" type="number" step="0.01" min="0" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Band High (₹)
            </label>
            <input name="priceBandHigh" type="number" step="0.01" min="0" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lot Size</label>
            <input name="lotSize" type="number" min="1" step="1" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Size (₹ Cr)
            </label>
            <input name="issueSize" type="number" step="0.01" min="0" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Face Value (₹)
            </label>
            <input name="faceValue" type="number" step="0.01" min="0" className="input w-full" />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Key Dates
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Open Date</label>
            <input name="openDate" type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
            <input name="closeDate" type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allotment Date
            </label>
            <input name="allotmentDate" type="date" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Date
            </label>
            <input name="listingDate" type="date" className="input w-full" />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Parties & Exchange Codes
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registrar</label>
            <input
              name="registrar"
              type="text"
              placeholder="e.g. KFin Technologies"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Managers
            </label>
            <input
              name="leadManagers"
              type="text"
              placeholder="e.g. ICICI Securities, Axis Capital"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BSE Code</label>
            <input name="bseCode" type="text" placeholder="e.g. 544120" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NSE Symbol</label>
            <input
              name="nseSymbol"
              type="text"
              placeholder="e.g. TATATECH"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Documents
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DRHP URL</label>
          <input
            name="drhpUrl"
            type="url"
            placeholder="https://sebi.gov.in/..."
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RHP URL</label>
          <input
            name="rhpUrl"
            type="url"
            placeholder="https://sebi.gov.in/..."
            className="input w-full"
          />
        </div>
      </div>

      {/* Objects of Issue */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Objects of Issue
        </h2>
        <textarea
          name="objectsOfIssue"
          rows={5}
          placeholder="Describe how proceeds will be used…"
          className="input w-full resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Saving…" : "Save IPO"}
      </button>
    </form>
  );
}
