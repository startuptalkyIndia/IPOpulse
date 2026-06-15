"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, CheckCircle2, AlertTriangle, ExternalLink, Clock } from "lucide-react";

interface Status {
  active: boolean;
  token?: string;
  updatedAt?: string;
  configured?: boolean;
  loginUrl?: string | null;
}

export default function FyersTokenPage() {
  const [authCode, setAuthCode] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/admin/fyers-token").then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    // Fyers redirects back here with ?auth_code=... — pick it up automatically.
    const params = new URLSearchParams(window.location.search);
    const code = params.get("auth_code");
    if (code) {
      setAuthCode(code);
      // Clean the URL so a refresh doesn't re-trigger.
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refresh]);

  async function handleActivate() {
    if (!authCode.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/admin/fyers-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authCode: authCode.trim() }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: "success", text: data.message });
        setAuthCode("");
        refresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed" });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fyers Live Token</h1>
          <p className="text-sm text-gray-500">Daily broker login for real-time prices (Kite backup)</p>
        </div>
      </div>

      {/* Current status */}
      <div className={`card ${status?.active ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex items-center gap-3">
          {status?.active ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <div className={`text-sm font-semibold ${status?.active ? "text-emerald-800" : "text-amber-800"}`}>
              {status?.active
                ? `✅ Fyers live ACTIVE — token: ${status.token}`
                : status?.configured === false
                  ? "⚠️ Fyers credentials not set on the server yet"
                  : "⚠️ No active token — other price sources in use"}
            </div>
            {status?.updatedAt && (
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {new Date(status.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data API permission warning */}
      <div className="card border-amber-200 bg-amber-50">
        <h3 className="text-sm font-bold text-amber-900 mb-1">One-time setup in your Fyers app</h3>
        <ul className="space-y-1 text-xs text-amber-800">
          <li>• Enable the <strong>Data API</strong> permission (Profile Details alone can&apos;t fetch quotes).</li>
          <li>• Set the app&apos;s <strong>Redirect URL</strong> to: <code className="bg-white px-1 rounded">https://ipopulse.talkytools.com/sup-min/fyers-token</code></li>
        </ul>
      </div>

      {/* Login + activate */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Activate today&apos;s token (takes 1 min)</h2>
        <ol className="space-y-2 text-sm text-gray-700 mb-4">
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>
              Click{" "}
              {status?.loginUrl ? (
                <a href={status.loginUrl} className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-semibold">
                  Log in to Fyers <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-400">Log in to Fyers (server not configured)</span>
              )}{" "}
              and sign in with your Fyers ID + PIN/TOTP.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>Fyers sends you back to this page — the auth code fills in automatically. Then press <strong>Activate</strong>.</span>
          </li>
        </ol>

        <div className="space-y-3">
          <input
            type="text"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder="auth_code (auto-filled after login, or paste it here)"
            className="input w-full font-mono text-sm"
          />
          <button
            onClick={handleActivate}
            disabled={saving || !authCode.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Activating..." : "Activate — Turn On Fyers Live Prices"}
          </button>
          {message && (
            <div className={`rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-indigo-50 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">Notes</h3>
        <ul className="space-y-1.5 text-xs text-indigo-800">
          <li>⏰ Token expires ~next day — log in again each morning at ~9 AM IST.</li>
          <li>💡 Without a Fyers token, the existing Yahoo/Kite price sources are used automatically.</li>
          <li>🔒 Your Fyers secret stays on the server; only the short-lived token is stored.</li>
        </ul>
      </div>
    </div>
  );
}
