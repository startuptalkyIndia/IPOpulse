"use client";

import { useState, useEffect } from "react";
import { Zap, CheckCircle2, AlertTriangle, ExternalLink, Clock } from "lucide-react";

export default function KiteTokenPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ active: boolean; updatedAt?: string; token?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/kite-token")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!token.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/admin/kite-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: "success", text: data.message });
        setToken("");
        // Refresh status
        fetch("/api/admin/kite-token").then((r) => r.json()).then(setStatus);
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
          <h1 className="text-xl font-bold text-gray-900">Kite Live Token</h1>
          <p className="text-sm text-gray-500">Enter daily token for real-time stock prices (no delay)</p>
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
                ? `✅ Live prices ACTIVE — token: ${status.token}`
                : "⚠️ No active token — using Yahoo Finance (15-min delayed)"}
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

      {/* How to get token */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-900 mb-3">How to get today&apos;s token (takes 2 min)</h2>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>Open Kite developer console: <a href="https://developers.kite.trade/apps" target="_blank" rel="noopener" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">developers.kite.trade/apps <ExternalLink className="w-3 h-3" /></a></span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>Click your app → <strong>&quot;API docs&quot;</strong> tab → scroll to <strong>&quot;Generate session&quot;</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <span>Or go to: <code className="bg-gray-100 px-1 rounded text-xs">https://kite.zerodha.com/connect/login?api_key=1uz5zfoxho7bd6qr&v=3</code> — log in, copy the <code className="bg-gray-100 px-1 rounded text-xs">request_token</code> from the redirect URL</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
            <span>Exchange request_token for access_token via the <a href="https://developers.kite.trade/docs/connect#generating-an-access-token" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Kite session API</a> or use the existing script below</span>
          </li>
        </ol>

        <div className="mt-4 bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono">
          <div className="text-gray-400 mb-1"># Run this once with your request_token from step 3:</div>
          <div>curl -X POST https://api.kite.trade/session/token \</div>
          <div>  -d &quot;api_key=1uz5zfoxho7bd6qr&request_token=YOUR_REQUEST_TOKEN&checksum=CHECKSUM&quot;</div>
          <div className="text-gray-400 mt-1"># Checksum = sha256(api_key + request_token + api_secret)</div>
          <div className="text-gray-400"># api_secret is in your .env on the server</div>
        </div>
      </div>

      {/* Token input */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Paste access token</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste Kite access_token here..."
            className="input w-full font-mono text-sm"
          />
          <button
            onClick={handleSave}
            disabled={saving || !token.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Token — Activate Live Prices"}
          </button>
          {message && (
            <div className={`rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* What this enables */}
      <div className="card bg-indigo-50 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">What live prices unlock</h3>
        <ul className="space-y-1.5 text-xs text-indigo-800">
          <li>✅ Real-time LTP for 2,300+ NSE stocks (no 15-min delay)</li>
          <li>✅ Screener shows current market prices during trading hours</li>
          <li>✅ Ticker page prices update every 5 minutes (vs daily EOD now)</li>
          <li>✅ Top gainers/losers on homepage reflect live session</li>
          <li>⏰ Token expires at midnight IST — enter fresh token each morning at 9 AM</li>
          <li>💡 Without token: Yahoo Finance v8 (15-min delayed) is used automatically</li>
        </ul>
      </div>
    </div>
  );
}
