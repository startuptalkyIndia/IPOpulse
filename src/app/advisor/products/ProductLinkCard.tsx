"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface Props {
  slug: string;
  name: string;
  payoutInr: number;
  advisorShareInr: number;
  refCode: string;
}

export function ProductLinkCard({ slug, name, payoutInr, advisorShareInr, refCode }: Props) {
  const [copied, setCopied] = useState(false);
  // The link points to our internal click-tracker, which records the click and forwards to the partner
  const trackedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${slug}?adv=${refCode}`
      : `https://ipopulse.talkytools.com/r/${slug}?adv=${refCode}`;

  function copyLink() {
    navigator.clipboard.writeText(trackedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `Open ${name} — quick & free via IPOpulse: ${trackedUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        <span className="text-xs text-green-600 font-semibold tabular-nums">
          You earn ₹{advisorShareInr.toLocaleString("en-IN")} / approved
        </span>
      </div>
      <code className="block bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] text-gray-700 font-mono break-all mb-3">
        {trackedUrl}
      </code>
      <div className="flex gap-2">
        <button onClick={copyLink} className="btn-primary text-xs flex-1 inline-flex items-center justify-center gap-1">
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy link</>}
        </button>
        <button onClick={shareWhatsApp} className="btn-secondary text-xs flex-1 inline-flex items-center justify-center gap-1">
          <Share2 className="w-3 h-3" /> WhatsApp
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">Partner commission: ₹{payoutInr.toLocaleString("en-IN")} · Your share: ₹{advisorShareInr.toLocaleString("en-IN")}</p>
    </div>
  );
}
