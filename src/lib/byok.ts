import { decryptApiKey } from "@/lib/encrypt";

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface BYOKUser {
  aiProvider: AIProvider | null;
  aiApiKey: string | null;
  aiModel: string | null;
  aiKeyVerified: boolean;
}

/** Call AI using the user's own key — pure fetch, no SDK dependency. */
export async function callUserAI(
  user: BYOKUser,
  prompt: string,
  options: { maxTokens?: number; systemPrompt?: string } = {}
): Promise<string> {
  if (!user.aiApiKey || !user.aiProvider || !user.aiKeyVerified) {
    throw new Error("NO_KEY: Connect your AI provider in Settings → AI");
  }
  const key = decryptApiKey(user.aiApiKey);
  const maxTokens = options.maxTokens ?? 1024;

  if (user.aiProvider === "anthropic") {
    const body: Record<string, unknown> = {
      model: user.aiModel ?? "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    };
    if (options.systemPrompt) body.system = options.systemPrompt;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
    const data = await res.json();
    return (data.content?.[0]?.text as string) ?? "";
  }

  if (user.aiProvider === "openai") {
    const messages: { role: string; content: string }[] = [];
    if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
    messages.push({ role: "user", content: prompt });
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: user.aiModel ?? "gpt-4o", max_tokens: maxTokens, messages }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return (data.choices?.[0]?.message?.content as string) ?? "";
  }

  if (user.aiProvider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${user.aiModel ?? "gemini-1.5-flash"}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
        signal: AbortSignal.timeout(30000),
      }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return (data.candidates?.[0]?.content?.parts?.[0]?.text as string) ?? "";
  }

  throw new Error(`Unknown provider: ${user.aiProvider}`);
}

/** Test if an API key is valid before saving. */
export async function testApiKey(
  provider: AIProvider,
  key: string
): Promise<{ valid: boolean; model?: string; error?: string }> {
  try {
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? { valid: true, model: "claude-3-5-sonnet-20241022" } : { valid: false, error: `HTTP ${res.status}` };
    }
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? { valid: true, model: "gpt-4o" } : { valid: false, error: `HTTP ${res.status}` };
    }
    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { signal: AbortSignal.timeout(8000) }
      );
      return res.ok ? { valid: true, model: "gemini-1.5-flash" } : { valid: false, error: `HTTP ${res.status}` };
    }
    return { valid: false, error: "Unknown provider" };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}