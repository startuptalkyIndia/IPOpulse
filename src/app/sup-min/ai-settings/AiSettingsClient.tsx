"use client";

import { useState, useEffect } from "react";
import { Cpu, CheckCircle2, AlertTriangle, Clock, KeyRound, Sparkles } from "lucide-react";

interface StatusResponse {
  mode: "subscription" | "api_key";
  hasKey: boolean;
  maskedKey: string | null;
  keyUpdatedAt: string | null;
  cliFound: boolean;
}

export default function AiSettingsClient() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [selectedMode, setSelectedMode] = useState<"subscription" | "api_key">("subscription");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function loadStatus() {
    fetch("/api/admin/ai-settings")
      .then((r) => r.json())
      .then((data: StatusResponse) => {
        setStatus(data);
        setSelectedMode(data.mode);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleSaveMode() {
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: selectedMode }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: "success", text: `AI provider set to ${selectedMode === "subscription" ? "Subscription" : "API key"}.` });
        loadStatus();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to update provider mode" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveKey() {
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: "success", text: "API key validated with a live test call and saved (encrypted)." });
        setApiKeyInput("");
        loadStatus();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to save API key" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleClearKey() {
    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearKey: true }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage({ type: "success", text: "Saved API key removed." });
        loadStatus();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to clear key" });
      }
    } finally {
      setSaving(false);
    }
  }

  const modeChanged = status && selectedMode !== status.mode;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Provider Settings</h1>
          <p className="text-sm text-gray-500">Choose how IPOpulse's AI features (DRHP AI, Concall AI, promoter check, market summary) are billed</p>
        </div>
      </div>

      {/* Current status */}
      <div className={`card ${status?.mode === "subscription" ? (status?.cliFound ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50") : status?.hasKey ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        {!status ? (
          <div className="text-sm text-gray-500">Loading current status…</div>
        ) : status.mode === "subscription" ? (
          <div className="flex items-center gap-3">
            {status.cliFound ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div className={`text-sm font-semibold ${status.cliFound ? "text-emerald-800" : "text-amber-800"}`}>
              {status.cliFound
                ? "Mode: Subscription — Claude CLI found on this server. AI features active."
                : "Mode: Subscription — Claude CLI NOT found on this server. AI features are unavailable (fails closed, never falls through to any API key)."}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {status.hasKey ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <div className={`text-sm font-semibold ${status.hasKey ? "text-emerald-800" : "text-amber-800"}`}>
                {status.hasKey
                  ? `Mode: API key — key saved (${status.maskedKey}). AI features active.`
                  : "Mode: API key — no key saved yet. AI features are unavailable until one is added below."}
              </div>
              {status.keyUpdatedAt && (
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Key last saved: {new Date(status.keyUpdatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div className="card space-y-3">
        <h2 className="text-sm font-bold text-gray-900">AI provider</h2>

        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedMode === "subscription" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`}>
          <input
            type="radio"
            name="ai-mode"
            className="mt-0.5"
            checked={selectedMode === "subscription"}
            onChange={() => setSelectedMode("subscription")}
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Subscription (default)
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Uses the founder's Claude subscription via the CLI on the server. Fixed cost, no per-token billing.
              If subscription access is down, AI features fail closed — never silently switches to an API key.
            </span>
          </span>
        </label>

        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedMode === "api_key" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`}>
          <input
            type="radio"
            name="ai-mode"
            className="mt-0.5"
            checked={selectedMode === "api_key"}
            onChange={() => setSelectedMode("api_key")}
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> API key
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Uses a separate Anthropic API key billed per token. Paste the key below — it is never read from
              server .env, never shown again after saving, and validated with a live test call before it's stored.
            </span>
          </span>
        </label>

        <button
          onClick={handleSaveMode}
          disabled={saving || !modeChanged}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : modeChanged ? `Switch to ${selectedMode === "subscription" ? "Subscription" : "API key"}` : "No mode change"}
        </button>
      </div>

      {/* API key input — only relevant in api_key mode, but always available so an admin can pre-save a key */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-900 mb-1">Anthropic API key</h2>
        <p className="text-xs text-gray-500 mb-3">
          Only used when AI provider is set to "API key" above. Get one at{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">
            console.anthropic.com/settings/keys
          </a>.
        </p>
        <div className="space-y-3">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={status?.hasKey ? "Paste a new key to replace the saved one..." : "Paste sk-ant-... key here..."}
            className="input w-full font-mono text-sm"
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveKey}
              disabled={saving || !apiKeyInput.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Validating & saving..." : "Validate & Save Key"}
            </button>
            {status?.hasKey && (
              <button
                onClick={handleClearKey}
                disabled={saving}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Key
              </button>
            )}
          </div>
          {message && (
            <div className={`rounded-lg px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-indigo-50 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">Why this exists</h3>
        <p className="text-xs text-indigo-800">
          2026-08-12 platform policy: several products previously shared one Anthropic API key in `.env` and it
          silently hit its usage cap with no visibility into which product caused it. Each product now defaults to
          the founder's Claude subscription (fixed cost) and only uses per-token API billing when explicitly
          switched on here, with a manually-pasted key — never picked up automatically from `.env`.
        </p>
      </div>
    </div>
  );
}
