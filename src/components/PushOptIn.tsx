"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { subscribePush } from "@/lib/push";

/**
 * Compact opt-in card for browser push alerts. Shows current subscription
 * state, has an enable/disable button. Server-side push delivery requires
 * VAPID keys configured + a saved subscription endpoint per user.
 */
export function PushOptIn() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    setVapidKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null);
    if (ok) {
      navigator.serviceWorker.getRegistration().then(async (reg) => {
        const sub = await reg?.pushManager.getSubscription();
        setEnabled(!!sub);
      });
    }
  }, []);

  async function handleEnable() {
    setMsg(null);
    if (!vapidKey) {
      setMsg("Push isn't configured yet — set NEXT_PUBLIC_VAPID_PUBLIC_KEY to enable.");
      return;
    }
    setBusy(true);
    try {
      const sub = await subscribePush(vapidKey);
      if (!sub) throw new Error("Subscription failed");
      // Store subscription on server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("Server didn't accept the subscription");
      setEnabled(true);
      setMsg("Subscribed — you'll get IPO open / GMP swing / allotment alerts.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Couldn't enable notifications");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <div className="card text-xs text-gray-500 inline-flex items-center gap-2">
        <BellOff className="w-4 h-4" /> This browser doesn&apos;t support push notifications. Try Chrome / Edge / Firefox on desktop or Android.
      </div>
    );
  }

  return (
    <div className="card border-indigo-200">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
          {enabled ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            {enabled ? "Push alerts on" : "Get IPO alerts via push"}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {enabled
              ? "We'll ping you when an IPO opens, GMP swings >5%, or your allotment is ready."
              : "Subscription window opens · GMP moves >5% · Allotment ready · Listing day. Free, no email."}
          </p>
          {msg ? <p className="text-[11px] text-gray-700 mt-1.5">{msg}</p> : null}
        </div>
        {!enabled ? (
          <button onClick={handleEnable} disabled={busy} className="btn-primary text-xs inline-flex items-center gap-1 disabled:opacity-60">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Enable
          </button>
        ) : null}
      </div>
    </div>
  );
}
