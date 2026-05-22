"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "whatsapp-banner-dismissed";
const WHATSAPP_URL = "https://whatsapp.com/channel/ipopulse";

export function WhatsAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  if (!visible) return null;

  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
      {/* Icon + copy */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* WhatsApp logo mark (SVG inline — no external deps) */}
        <span className="flex-shrink-0 mt-0.5 sm:mt-0">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="16" fill="#25D366" />
            <path
              d="M23.6 8.4A10.5 10.5 0 0 0 16 5.5 10.5 10.5 0 0 0 5.5 16c0 1.85.49 3.65 1.41 5.23L5.5 26.5l5.43-1.42A10.48 10.48 0 0 0 16 26.5a10.5 10.5 0 0 0 10.5-10.5c0-2.8-1.09-5.43-3.07-7.41zm-7.6 16.14a8.7 8.7 0 0 1-4.44-1.22l-.32-.19-3.23.85.86-3.15-.2-.33a8.72 8.72 0 1 1 7.33 4.04zm4.79-6.53c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.65.85-.8 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.4-2.1-1.29a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44H11.7c-.17 0-.44.06-.67.32-.23.26-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.78 2.72 4.32 3.81.6.26 1.07.42 1.44.54.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.2-.58.2-1.08.14-1.19-.06-.11-.23-.17-.49-.3z"
              fill="#fff"
            />
          </svg>
        </span>
        <p className="text-green-800 leading-snug">
          <span className="font-semibold">Get IPO alerts on WhatsApp</span>
          {" — "}GMP updates, allotment results, subscription status.
          {" "}Join 10,000+ investors tracking IPOs for free.
        </p>
      </div>

      {/* CTA + dismiss */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
        <Link
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Join Channel →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss WhatsApp banner"
          className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
