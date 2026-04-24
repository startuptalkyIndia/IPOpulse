"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export function NewsletterSignup({ variant = "inline" }: { variant?: "inline" | "card" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "ok" : "err");
    if (res.ok) setEmail("");
  }

  if (variant === "card") {
    return (
      <div className="card bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Get the daily IPO digest</h3>
            <p className="text-xs text-gray-600 mb-3">
              Live IPOs, GMP movements, FII/DII flows, super-investor moves — in your inbox each morning. Free.
            </p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                className="input flex-1"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "ok"}
              />
              <button type="submit" className="btn-primary whitespace-nowrap" disabled={status === "loading" || status === "ok"}>
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : status === "ok" ? <><Check className="w-4 h-4 inline mr-1" /> Subscribed</> : "Subscribe"}
              </button>
            </form>
            {status === "err" ? <p className="text-xs text-red-600 mt-2">Please enter a valid email.</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        className="input flex-1 text-xs"
        placeholder="Email for daily digest"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "ok"}
      />
      <button type="submit" className="text-xs font-medium bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={status === "loading" || status === "ok"}>
        {status === "loading" ? "..." : status === "ok" ? "✓" : "Subscribe"}
      </button>
    </form>
  );
}
