// Source: _shared/templates/components/TwoFactorSetup.tsx — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/components/TwoFactorSetup.tsx
// /sup-min 2FA enrollment UI. Pairs with lib/2fa.ts.
//
// Copy to: src/components/admin/TwoFactorSetup.tsx
//
// Deps: react, lucide-react
//
// Flow:
//   1. Page-mount → POST /api/admin/2fa/init → { otpauthUrl, qrDataUrl, secret }
//   2. User scans QR + enters first 6-digit token.
//   3. POST /api/admin/2fa/confirm → { ok, backupCodes }
//   4. Show backup codes once; user confirms they've saved them.
//
// This component is UI-only. The API routes generating + persisting
// the secret are project-specific (admin users live in different schemas).

"use client";

import * as React from "react";
import { ShieldCheck, Copy, Check, AlertCircle } from "lucide-react";

export interface TwoFactorSetupProps {
  /** Endpoint that returns { otpauthUrl, qrDataUrl, secret }. */
  initEndpoint?: string;
  /** Endpoint that takes { token } and returns { ok, backupCodes? }. */
  confirmEndpoint?: string;
  /** Called once enrollment is fully complete. */
  onComplete?: () => void;
}

interface InitResponse {
  otpauthUrl: string;
  qrDataUrl: string;
  secret: string;
}

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

/**
 * TwoFactorSetup — admin 2FA enrollment UI.
 *
 * @example
 *   <TwoFactorSetup
 *     initEndpoint="/api/sup-min/2fa/init"
 *     confirmEndpoint="/api/sup-min/2fa/confirm"
 *     onComplete={() => router.push("/sup-min")}
 *   />
 */
export function TwoFactorSetup({
  initEndpoint = "/api/sup-min/2fa/init",
  confirmEndpoint = "/api/sup-min/2fa/confirm",
  onComplete,
}: TwoFactorSetupProps) {
  const [stage, setStage] = React.useState<"loading" | "scan" | "codes" | "done" | "error">(
    "loading",
  );
  const [data, setData] = React.useState<InitResponse | null>(null);
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(initEndpoint, { method: "POST" });
        if (!res.ok) throw new Error(`Init failed (${res.status})`);
        const json = (await res.json()) as InitResponse;
        if (cancelled) return;
        setData(json);
        setStage("scan");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to start 2FA setup");
        setStage("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initEndpoint]);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(confirmEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.replace(/\s+/g, "") }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Invalid code. Try again.");
      }
      setBackupCodes(json.backupCodes ?? []);
      setStage("codes");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — user can manually select
    }
  };

  const finish = () => {
    setStage("done");
    onComplete?.();
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-indigo-600">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="text-lg font-semibold text-slate-900">
          Two-factor authentication
        </h2>
      </div>

      {stage === "loading" && (
        <p className="text-sm text-slate-600">Preparing your secret…</p>
      )}

      {stage === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>{error ?? "Something went wrong."}</div>
        </div>
      )}

      {stage === "scan" && data && (
        <form onSubmit={confirm} className="space-y-4">
          <p className="text-sm text-slate-600">
            Scan this QR with Google Authenticator, Authy, or 1Password, then
            enter the 6-digit code it shows.
          </p>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrDataUrl}
              alt="2FA QR code"
              className="h-48 w-48 rounded-lg border border-slate-200"
            />
          </div>
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer hover:text-slate-700">
              Can&rsquo;t scan? Enter the secret manually
            </summary>
            <code className="mt-2 block break-all rounded bg-slate-50 p-2 text-slate-700">
              {data.secret}
            </code>
          </details>

          <div>
            <label
              htmlFor="totp-token"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Verification code
            </label>
            <input
              id="totp-token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              aria-invalid={!!error}
              className={cx(
                "block w-full rounded-xl border bg-white px-3 py-2 text-sm tracking-widest text-slate-900 shadow-sm focus:outline-none focus:ring-2",
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30",
              )}
              placeholder="123 456"
            />
            {error ? (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {error}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting || token.length < 6}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Verifying…" : "Verify and enable"}
          </button>
        </form>
      )}

      {stage === "codes" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Save these <strong>backup codes</strong> somewhere safe. Each can
            be used once if you lose access to your authenticator app.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-800">
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={copyCodes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy all
                </>
              )}
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-xl bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              I&rsquo;ve saved them
            </button>
          </div>
        </div>
      )}

      {stage === "done" && (
        <p className="text-sm text-slate-600">
          Two-factor authentication is now active on this admin account.
        </p>
      )}
    </div>
  );
}

export default TwoFactorSetup;
