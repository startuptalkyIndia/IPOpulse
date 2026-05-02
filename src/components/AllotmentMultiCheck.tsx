"use client";

/**
 * Unified allotment check helper. User enters PAN once, picks an IPO (or
 * "all"), we open the right registrar(s) in new tabs. Most registrars don't
 * accept query-string prefill (they have CAPTCHAs and dropdowns), so we open
 * the official URL and the user pastes the PAN. The win is: one screen,
 * everything organised, no hunting.
 */

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { Registrar } from "@/lib/registrars";
import { registrars } from "@/lib/registrars";

interface IpoOption {
  slug: string;
  name: string;
  registrarSlug: string | null;
  registrarUrl: string | null;
}

export function AllotmentMultiCheck({ ipos }: { ipos: IpoOption[] }) {
  const [pan, setPan] = useState("");
  const [selectedIpo, setSelectedIpo] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const trimmedPan = pan.trim().toUpperCase();
  const validPan = /^[A-Z]{5}\d{4}[A-Z]$/.test(trimmedPan);

  function copyPan() {
    if (!validPan) return;
    navigator.clipboard.writeText(trimmedPan).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openSpecific() {
    const ipo = ipos.find((i) => i.slug === selectedIpo);
    if (!ipo) return;
    const url = ipo.registrarUrl ?? registrars.find((r) => r.slug === ipo.registrarSlug)?.allotmentUrl;
    if (url) {
      copyPan();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openAllMajor() {
    copyPan();
    // Open KFintech, Link Intime, Bigshare, Cameo (the 4 most common)
    const major: Registrar[] = registrars.filter((r) => ["kfintech", "linkintime", "bigshare", "cameo"].includes(r.slug));
    major.forEach((r, i) => {
      // Stagger opens slightly so popup blocker doesn't aggregate
      setTimeout(() => window.open(r.allotmentUrl, "_blank", "noopener,noreferrer"), i * 80);
    });
  }

  return (
    <div className="card border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-5 h-5 text-indigo-600" />
        <h2 className="text-base font-semibold text-gray-900">Quick allotment check</h2>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Enter your PAN once. We&apos;ll copy it to clipboard and open the right registrar(s) in new tabs — paste &amp;
        check. Faster than tab-hopping yourself.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div className="md:col-span-1">
          <label className="label">Your PAN</label>
          <input
            type="text"
            className={`input w-full font-mono uppercase ${pan && !validPan ? "border-red-300" : ""}`}
            placeholder="ABCDE1234F"
            value={pan}
            maxLength={10}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
          />
          {pan && !validPan ? (
            <div className="text-[11px] text-red-600 mt-1">Invalid PAN format (5 letters + 4 digits + 1 letter)</div>
          ) : null}
        </div>
        <div className="md:col-span-1">
          <label className="label">For which IPO?</label>
          <select className="input w-full" value={selectedIpo} onChange={(e) => setSelectedIpo(e.target.value)}>
            <option value="">— Pick to open one registrar —</option>
            {ipos.map((i) => (
              <option key={i.slug} value={i.slug}>{i.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openSpecific}
            disabled={!validPan || !selectedIpo}
            className="btn-primary flex-1 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check this IPO <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={openAllMajor}
          disabled={!validPan}
          className="btn-secondary text-xs inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Open all 4 major registrars <ExternalLink className="w-3 h-3" />
        </button>
        {copied ? (
          <span className="text-xs text-green-600 font-medium">PAN copied to clipboard ✓</span>
        ) : null}
      </div>

      <p className="text-[11px] text-gray-500 mt-3">
        We never store your PAN. It&apos;s only copied to your local clipboard so you can paste into the registrar form.
      </p>
    </div>
  );
}
