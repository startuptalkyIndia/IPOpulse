"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const PROVIDERS = [
  { value: "anthropic", label: "Anthropic Claude", placeholder: "sk-ant-api03-...", url: "https://console.anthropic.com/keys" },
  { value: "openai",    label: "OpenAI GPT-4",     placeholder: "sk-...",           url: "https://platform.openai.com/api-keys" },
  { value: "gemini",    label: "Google Gemini",    placeholder: "AIzaSy...",        url: "https://aistudio.google.com/app/apikey" },
];
const MODELS: Record<string, { value: string; label: string }[]> = {
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Recommended)" },
    { value: "claude-3-haiku-20240307",    label: "Claude 3 Haiku (Fast & Cheap)" },
  ],
  openai: [
    { value: "gpt-4o",      label: "GPT-4o (Recommended)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cheap)" },
  ],
  gemini: [
    { value: "gemini-1.5-pro",   label: "Gemini 1.5 Pro (Recommended)" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast & Cheap)" },
  ],
};

export function AISettings() {
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey]     = useState("");
  const [model, setModel]       = useState(MODELS.anthropic[0].value);
  const [status, setStatus]     = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [connected, setConnected] = useState<any>(null);
  const [error, setError]       = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetch("/api/settings/ai").then(r => r.json()).then(d => { if (d.aiKeyVerified) setConnected(d); });
  }, []);

  const handleProvider = (p: string) => { setProvider(p); setModel(MODELS[p][0].value); };

  const save = async () => {
    setStatus("saving"); setError("");
    const res = await fetch("/api/settings/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, apiKey, model }) });
    const data = await res.json();
    if (!res.ok) { setStatus("error"); setError(data.error); return; }
    setStatus("saved"); setConnected({ aiProvider: provider, aiModel: data.model, aiKeyVerified: true }); setApiKey("");
  };

  const disconnect = async () => { await fetch("/api/settings/ai", { method: "DELETE" }); setConnected(null); setStatus("idle"); };
  const pInfo = PROVIDERS.find(p => p.value === provider)!;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">AI Provider</h3>
      <p className="text-sm text-gray-500 mb-5">Connect your own API key. You pay the provider directly — we never see your usage.</p>
      {connected?.aiKeyVerified && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
          <div>
            <span className="text-green-700 font-semibold text-sm">Connected — {PROVIDERS.find(p => p.value === connected.aiProvider)?.label}</span>
            <div className="text-xs text-green-600 mt-0.5">Model: {connected.aiModel}</div>
          </div>
          <button onClick={disconnect} className="text-xs text-red-500 hover:text-red-700 font-medium">Disconnect</button>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select value={provider} onChange={e => handleProvider(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {MODELS[provider].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key <a href={pInfo.url} target="_blank" rel="noopener" className="text-indigo-600 font-normal">Get key →</a></label>
          <div className="relative">
            <input type={showApiKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={pInfo.placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm font-mono" />
            <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={save} disabled={!apiKey || status === "saving"} className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {status === "saving" ? "Testing key..." : status === "saved" ? "Saved!" : "Save & Test"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">Your key is encrypted with AES-256 before storage. We never log or transmit it.</p>
    </div>
  );
}
