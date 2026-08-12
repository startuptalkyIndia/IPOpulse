import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAiProviderStatus,
  setAiProviderMode,
  setAnthropicApiKey,
  clearAnthropicApiKey,
  type AiProviderMode,
} from "@/lib/ai-provider-setting";
import { claudeAvailable } from "@/lib/claude-runner";
import { mapAnthropicApiError } from "@/lib/ai-errors";

/**
 * Admin AI-provider settings — platform B.20 (2026-08-12).
 *
 * GET  -> current mode, whether a key is saved (masked), whether the CLI
 *         binary is actually found on this server.
 * POST -> switch mode and/or save a new Anthropic API key. The key is
 *         validated with a tiny live test call BEFORE it is stored (so a
 *         bad paste never silently becomes "saved"), then encrypted at rest.
 *         Never auto-populated from .env, never rendered back in the response.
 */

async function adminGuard() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin" || role === "superadmin";
}

export async function GET() {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const status = await getAiProviderStatus();
  // Report CLI presence unconditionally (not gated on current mode) so the
  // admin can see, before switching, whether Subscription mode will actually work.
  const cli = await import("@/lib/which-util").then((m) => m.which("claude"));
  return NextResponse.json({
    ...status,
    cliFound: !!cli,
  });
}

export async function POST(req: NextRequest) {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const mode = body.mode as string | undefined;
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : undefined;
  const clearKey = body.clearKey === true;

  if (mode !== undefined && mode !== "subscription" && mode !== "api_key") {
    return NextResponse.json({ error: "mode must be 'subscription' or 'api_key'" }, { status: 400 });
  }

  if (clearKey) {
    await clearAnthropicApiKey();
  }

  if (apiKey) {
    if (apiKey.length < 20) {
      return NextResponse.json({ error: "That doesn't look like a valid Anthropic API key." }, { status: 400 });
    }
    // Validate with a tiny live test call BEFORE storing — never persist a key
    // that doesn't actually work, so the admin finds out immediately, not the
    // next time a user hits an AI feature.
    const testResult = await testAnthropicKey(apiKey);
    if (!testResult.ok) {
      return NextResponse.json({ error: testResult.error }, { status: 400 });
    }
    await setAnthropicApiKey(apiKey);
  }

  if (mode) {
    await setAiProviderMode(mode as AiProviderMode);
  }

  const status = await getAiProviderStatus();
  const availability = await claudeAvailable();
  return NextResponse.json({ ok: true, ...status, currentlyAvailable: availability.available });
}

async function testAnthropicKey(apiKey: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey, timeout: 15_000 });
    await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true };
  } catch (err) {
    console.error("[ai-settings] key validation failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: `Key validation failed: ${mapAnthropicApiError(err).message}` };
  }
}
