"use client";

import { useState, useTransition } from "react";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  ipoName: string;
  ipoSymbol?: string | null;
  ipoSlug: string;
  authed: boolean;
}

type AlertType = "gmp_threshold" | "allotment" | "listing" | "subscription_open" | "subscription_close";

const ALERT_OPTIONS: { type: AlertType; label: string; description: string; hasThreshold: boolean }[] = [
  {
    type: "gmp_threshold",
    label: "GMP change alert",
    description: "Notify me when GMP changes by a set percentage",
    hasThreshold: true,
  },
  {
    type: "allotment",
    label: "Allotment result",
    description: "Notify me when allotment results are out",
    hasThreshold: false,
  },
  {
    type: "listing",
    label: "Listing day alert",
    description: "Notify me on the listing day",
    hasThreshold: false,
  },
  {
    type: "subscription_open",
    label: "Issue opens",
    description: "Notify me when the IPO subscription window opens",
    hasThreshold: false,
  },
  {
    type: "subscription_close",
    label: "Issue closes",
    description: "Notify me when the IPO subscription window closes",
    hasThreshold: false,
  },
];

export function SetAlertButton({ ipoName, ipoSymbol, ipoSlug, authed }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AlertType>("gmp_threshold");
  const [threshold, setThreshold] = useState<string>("10");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [pending, start] = useTransition();

  function handleOpen() {
    if (!authed) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setOpen(true);
    setStatus("idle");
  }

  const selectedOption = ALERT_OPTIONS.find((o) => o.type === selectedType)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    start(async () => {
      const body: Record<string, unknown> = {
        ipoName,
        ipoSymbol: ipoSymbol ?? null,
        ipoSlug,
        type: selectedType,
      };
      if (selectedOption.hasThreshold && threshold) {
        body.threshold = parseFloat(threshold);
      }

      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus("success");
      } else if (res.status === 409) {
        setStatus("duplicate");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Failed to save alert");
        setStatus("error");
      }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
        aria-label="Set alert for this IPO"
      >
        <Bell className="w-3.5 h-3.5" />
        Set Alert
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Set IPO Alert</h2>
                  <p className="text-xs text-gray-500">{ipoName}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              {status === "success" ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Alert saved!</div>
                    <div className="text-xs text-gray-500 mt-1">
                      We&apos;ll email you when this event happens for {ipoName}.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Alert type selector */}
                  <div className="space-y-2">
                    <label className="label">Alert type</label>
                    <div className="space-y-2">
                      {ALERT_OPTIONS.map((opt) => (
                        <label
                          key={opt.type}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            selectedType === opt.type
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="alertType"
                            value={opt.type}
                            checked={selectedType === opt.type}
                            onChange={() => setSelectedType(opt.type)}
                            className="mt-0.5 accent-indigo-600"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                            <div className="text-xs text-gray-500">{opt.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* GMP threshold input */}
                  {selectedOption.hasThreshold ? (
                    <div>
                      <label className="label" htmlFor="threshold">
                        Alert me when GMP changes by
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="threshold"
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          className="input w-24"
                          value={threshold}
                          onChange={(e) => setThreshold(e.target.value)}
                          required={selectedOption.hasThreshold}
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Error states */}
                  {status === "duplicate" ? (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      You already have this alert set for {ipoName}.
                    </div>
                  ) : null}
                  {status === "error" ? (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errorMsg || "Something went wrong. Please try again."}
                    </div>
                  ) : null}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex-1 btn-primary text-sm"
                    >
                      {pending ? "Saving..." : "Save alert"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
