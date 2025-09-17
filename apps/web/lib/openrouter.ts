/**
 * Normalize the configured OpenRouter base URL to the chat completions endpoint.
 * Accepts either the root API (https://openrouter.ai/api/v1) or a direct
 * /chat/completions endpoint and ensures the returned value always targets the
 * streaming completions URL exactly once.
 */
export function buildCompletionsUrl(base?: string): string {
  const rawBaseUrl = base?.trim() ?? "";
  const effectiveBase = rawBaseUrl.length > 0 ? rawBaseUrl : "https://openrouter.ai/api/v1";
  const trimmedBase = effectiveBase.replace(/\/+$/, "");
  return trimmedBase.endsWith("/chat/completions") ? trimmedBase : `${trimmedBase}/chat/completions`;
}
