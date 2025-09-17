const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetAt?: number;
  reason?: string;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function enforceRateLimit({ key, limit, windowSeconds }: RateLimitOptions): Promise<RateLimitResult> {
  if (!upstashUrl || !upstashToken || limit <= 0) {
    return { success: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }

  try {
    const body = JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSeconds, "NX"],
    ]);

    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${upstashToken}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { success: true, reason: `Upstash error ${res.status}: ${text}` };
    }

    const data: Array<{ result: number | string }> = await res.json();
    const counter = Number(data[0]?.result ?? 0);
    if (Number.isNaN(counter)) {
      return { success: true };
    }

    if (counter > limit) {
      return { success: false, remaining: 0, resetAt: Date.now() + windowSeconds * 1000 };
    }

    return { success: true, remaining: Math.max(0, limit - counter), resetAt: Date.now() + windowSeconds * 1000 };
  } catch (error) {
    console.warn("Rate limiter failed", error);
    return { success: true, reason: "Rate limiter unavailable" };
  }
}
