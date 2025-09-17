import { format } from "date-fns";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export type PlanTier = "free" | "pro";

const DEFAULT_LIMITS: Record<PlanTier, number> = {
  free: Number(process.env.FREE_DAILY_LIMIT ?? 50),
  pro: Number(process.env.PRO_DAILY_LIMIT ?? 5000),
};

class UsageLimitError extends Error {
  constructor(message: string, readonly remaining: number) {
    super(message);
    this.name = "UsageLimitError";
  }
}

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function inMemoryStore() {
  const globalRef = globalThis as typeof globalThis & { __usageMemory?: Map<string, { count: number; expires: number }> };
  if (!globalRef.__usageMemory) {
    globalRef.__usageMemory = new Map();
  }
  return globalRef.__usageMemory;
}

async function incrementRedis(key: string, ttlSeconds: number): Promise<number | null> {
  if (!upstashUrl || !upstashToken) return null;

  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, ttlSeconds, "NX"],
    ]),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    console.warn("Upstash usage increment failed", res.status, text);
    return null;
  }

  const data: Array<{ result: number }> = await res.json();
  const value = Number(data[0]?.result ?? 0);
  return Number.isNaN(value) ? null : value;
}

async function decrementRedis(key: string) {
  if (!upstashUrl || !upstashToken) return;
  try {
    await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["DECR", key]]),
    });
  } catch (error) {
    console.warn("Upstash usage decrement failed", error);
  }
}

function formatKey(userId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  return `usage:${userId}:${today}`;
}

export interface UsageSummary {
  plan: PlanTier;
  usedToday: number;
  dailyLimit: number;
}

export async function getUsageSummary(userId: string, plan: PlanTier): Promise<UsageSummary> {
  const dailyLimit = DEFAULT_LIMITS[plan];
  const key = formatKey(userId);
  let usedToday = 0;

  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        usedToday = Number(json?.result ?? 0);
      }
    } catch (error) {
      console.warn("Usage summary fetch failed", error);
    }
  } else {
    const store = inMemoryStore();
    const entry = store.get(key);
    if (entry && entry.expires > Date.now()) {
      usedToday = entry.count;
    } else if (entry) {
      store.delete(key);
    }
  }

  if (Number.isNaN(usedToday)) usedToday = 0;
  return { plan, usedToday, dailyLimit };
}

export async function recordUsage(userId: string, plan: PlanTier): Promise<void> {
  if (plan === "pro") return; // unlimited for now

  const dailyLimit = DEFAULT_LIMITS[plan];
  const key = formatKey(userId);
  const ttlSeconds = secondsUntilMidnight();

  if (dailyLimit <= 0) return;

  const redisValue = await incrementRedis(key, ttlSeconds);
  if (redisValue !== null) {
    if (redisValue > dailyLimit) {
      await decrementRedis(key);
      throw new UsageLimitError("Daily usage limit reached", 0);
    }
    return;
  }

  // Fallback in-memory counter (dev/tests)
  const store = inMemoryStore();
  const entry = store.get(key);
  const now = Date.now();
  if (!entry || entry.expires <= now) {
    store.set(key, { count: 1, expires: now + ttlSeconds * 1000 });
    return;
  }

  if (entry.count >= dailyLimit) {
    throw new UsageLimitError("Daily usage limit reached", 0);
  }

  entry.count += 1;
}

export function getPlanFromSession(session: { user?: { plan?: PlanTier } } | null | undefined): PlanTier {
  return session?.user?.plan === "pro" ? "pro" : "free";
}

export { UsageLimitError };
