"use client";

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";

interface Props {
  partner: string;
  label: string;
  url: string;
}

export function MobileStickyCta({ partner, label, url }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ipopulse-cta-dismissed");
    if (stored === "1") setDismissed(true);

    function onScroll() {
      if (dismissed) return;
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem("ipopulse-cta-dismissed", "1");
  }

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:hidden z-30">
      <div className="bg-indigo-600 text-white rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2">
        <Zap className="w-4 h-4 flex-shrink-0" />
        <a
          href={url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          data-affiliate={partner}
          className="flex-1 text-xs font-medium"
        >
          {label}
        </a>
        <button onClick={dismiss} className="text-white/70 hover:text-white" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
