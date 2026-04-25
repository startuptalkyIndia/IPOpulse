"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyRefCode({ refCode }: { refCode: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <code className="bg-white border border-indigo-200 rounded-lg px-4 py-2 text-2xl font-mono font-bold text-indigo-700">
        {refCode}
      </code>
      <button
        onClick={copy}
        className="btn-secondary inline-flex items-center gap-1 text-xs"
      >
        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
      </button>
    </div>
  );
}
