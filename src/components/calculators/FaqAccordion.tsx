"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CalcFaq } from "@/lib/calculators/types";

export function FaqAccordion({ faq }: { faq: CalcFaq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
      {faq.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">{f.q}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i ? (
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
