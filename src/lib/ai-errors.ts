/**
 * Typed AI-call errors (platform standard B.20 rule 7).
 *
 * Every AI call throws one of these kinds instead of a raw Error/exit-code
 * so callers can render a plain-language message and pick the right HTTP
 * status. Never surface a raw stack trace / "exit 1" / SDK error string to
 * an end user.
 */

export type AiErrorKind = "rate_limit" | "timeout" | "auth" | "unavailable" | "unknown";

export class AiError extends Error {
  readonly kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.name = "AiError";
    this.kind = kind;
  }
}

/** Render any AI-call error as a plain-language sentence for the UI. */
export function friendlyAiError(err: unknown): string {
  if (err instanceof AiError) return err.message;
  return "AI request failed. Please try again in a moment.";
}

/** Map a raw Anthropic SDK error (or anything else) into a typed, friendly AiError. */
export function mapAnthropicApiError(err: unknown): AiError {
  if (err instanceof AiError) return err;

  const status = (err as { status?: number } | undefined)?.status;
  const retryAfterHeader =
    (err as { headers?: Record<string, string> } | undefined)?.headers?.["retry-after"];

  if (status === 401 || status === 403) {
    return new AiError(
      "auth",
      "The Anthropic API key was rejected (invalid or revoked). Double-check the key and try again.",
    );
  }
  if (status === 429) {
    const wait = retryAfterHeader ? `${retryAfterHeader}s` : "a minute";
    return new AiError("rate_limit", `AI is temporarily rate-limited — please try again in ${wait}.`);
  }
  if (status === 529) {
    return new AiError("rate_limit", "Claude is overloaded right now — please try again shortly.");
  }
  if (err instanceof Error && /timeout/i.test(err.message)) {
    return new AiError("timeout", "The AI request took too long and timed out. Please try again.");
  }
  return new AiError("unknown", "AI request failed. Please try again in a moment.");
}

/** HTTP status to use when surfacing an AiError (or unknown error) from an API route. */
export function aiErrorStatus(err: unknown): number {
  if (err instanceof AiError) {
    switch (err.kind) {
      case "rate_limit":
        return 429;
      case "timeout":
        return 504;
      case "auth":
      case "unavailable":
        return 503;
      default:
        return 500;
    }
  }
  return 500;
}
