export type AIProvider = "anthropic" | "openai" | "gemini";

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