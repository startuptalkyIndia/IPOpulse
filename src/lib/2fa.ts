// Source: _shared/templates/lib/2fa.ts — do not edit here, edit in _shared/ and re-propagate.
// _shared/templates/lib/2fa.ts
// TOTP-based two-factor authentication helpers for /sup-min admin routes.
//
// Copy to: src/lib/2fa.ts
//
// Deps: otplib (^12), node:crypto (built-in)
//
// Usage:
//   import { generateSecret, verifyToken, generateBackupCodes } from "@/lib/2fa";
//
//   // During enrollment:
//   const { secret, otpauthUrl } = generateSecret({ accountName: "admin@billforge", issuer: "BillForge" });
//   // Render QR for otpauthUrl, store `secret` against the admin user, encrypted at rest.
//
//   // During login:
//   const ok = verifyToken(user.totpSecret, submittedToken);
//
//   // Backup codes (one-time use, hashed before storing):
//   const codes = generateBackupCodes(8);

import { authenticator } from "otplib";
import { randomBytes, createHash } from "node:crypto";

// 30-second steps with ±1 window tolerance is the de-facto standard
// for Google Authenticator / Authy / 1Password compatibility.
authenticator.options = {
  step: 30,
  window: 1,
};

export interface GenerateSecretOptions {
  /** Identifier for the account (typically the admin email). */
  accountName: string;
  /** Issuer label shown in the authenticator app. Default "TalkyTools". */
  issuer?: string;
}

export interface GeneratedSecret {
  /** Base32 secret to persist (encrypted at rest). */
  secret: string;
  /** otpauth:// URL — render as QR code for the user's authenticator app. */
  otpauthUrl: string;
}

/**
 * Generate a fresh TOTP secret + provisioning URL.
 * Show the QR to the user once during enrollment; persist `secret` (encrypted).
 */
export function generateSecret(
  options: GenerateSecretOptions,
): GeneratedSecret {
  const { accountName, issuer = "TalkyTools" } = options;
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(accountName, issuer, secret);
  return { secret, otpauthUrl };
}

/**
 * Verify a 6-digit TOTP token against the stored secret.
 * Returns false on any error (invalid secret, malformed token, etc.).
 */
export function verifyToken(secret: string, token: string): boolean {
  if (!secret || !token) return false;
  const cleaned = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  try {
    return authenticator.verify({ token: cleaned, secret });
  } catch {
    return false;
  }
}

/**
 * Generate N one-time backup codes (default 8).
 * Each code is 10 hex chars (40 bits of entropy) formatted as `xxxxx-xxxxx`
 * for readability. Store ONLY the hashed form (see `hashBackupCode`).
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = randomBytes(5).toString("hex"); // 10 chars
    codes.push(`${hex.slice(0, 5)}-${hex.slice(5, 10)}`);
  }
  return codes;
}

/**
 * Hash a backup code for at-rest storage. Use this before persisting,
 * and again when verifying user-submitted codes.
 */
export function hashBackupCode(code: string): string {
  return createHash("sha256")
    .update(code.replace(/[\s-]/g, "").toLowerCase())
    .digest("hex");
}

/**
 * Verify a submitted backup code against a list of stored hashes.
 * Returns the matched hash (so the caller can mark it as used) or null.
 */
export function verifyBackupCode(
  submitted: string,
  storedHashes: string[],
): string | null {
  const hash = hashBackupCode(submitted);
  return storedHashes.includes(hash) ? hash : null;
}
