import { decryptApiKey } from "@/lib/encrypt";

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface BYOKUser {
  aiProvider: AIProvider | null;
  aiApiKey: string | null;
  aiModel: string | null;
  aiKeyVerified: boolean;
}

export async function callUserAI(
  user: BYOKUser,
  prompt: string,
  options: { maxTokens?: number; systemPrompt?: string } = {}
): Promise<string> {
  if (!user.aiApiKey || !user.aiProvider || !user.aiKeyVerified) {
    throw new Error("NO_KEY: Connect your AI provider in Settings → AI");
  }
  const apiKey = decryptApiKey(user.aiApiKey);
  const maxTokens = options.maxTokens ?? 1024;

  if (user.aiProvider === "anthropic") {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: user.aiModel ?? "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
      messages: [{ role: "user", content: prompt }],
    });
    return msg.content[0].type === "text" ? msg.content[0].text : "";
  }

  if (user.aiProvider === "openai") {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    const messages: any[] = [];
    if (options.systemPrompt) messages.push({ role: "system", content: options.systemPrompt });
    messages.push({ role: "user", content: prompt });
    const resp = await client.chat.completions.create({
      model: user.aiModel ?? "gpt-4o",
      max_tokens: maxTokens,
      messages,
    });
    return resp.choices[0].message.content ?? "";
  }

  if (user.aiProvider === "gemini") {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${user.aiModel ?? "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );
    if (!resp.ok) throw new Error(`Gemini error: ${resp.status}`);
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  throw new Error(`Unknown provider: ${user.aiProvider}`);
}

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
