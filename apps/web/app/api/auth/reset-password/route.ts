import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { consumePasswordResetToken, hashToken } from "@/lib/password-reset";
import { enforceRateLimit } from "@/lib/rate-limit";
import { db } from "@/db/client";
import { passwordResetTokens } from "@/db/schema/password-reset-tokens";
import { users } from "@/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

const IP_LIMIT_WINDOW = 60 * 60; // 1 hour
const IP_LIMIT = 30;

export const dynamic = "force-dynamic";

function getClientIp(req: Request): string {
  const header = req.headers.get("x-forwarded-for");
  if (!header) return "unknown";
  const parts = header.split(",");
  return parts[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CACHE_HEADERS });
  }

  const parsed = ResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: CACHE_HEADERS });
  }

  const ip = getClientIp(req);
  const ipLimit = await enforceRateLimit({ key: `password-reset:reset:ip:${ip}`, limit: IP_LIMIT, windowSeconds: IP_LIMIT_WINDOW });
  if (!ipLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: CACHE_HEADERS });
  }

  const { token, password } = parsed.data;
  const record = await consumePasswordResetToken(token);

  if (!record) {
    await enforceRateLimit({ key: `password-reset:invalid-token:${hashToken(token)}`, limit: 5, windowSeconds: IP_LIMIT_WINDOW });
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 410, headers: CACHE_HEADERS });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, record.userId));

      await tx
        .update(passwordResetTokens)
        .set({ consumedAt: now })
        .where(eq(passwordResetTokens.id, record.id));

      await tx
        .delete(passwordResetTokens)
        .where(and(eq(passwordResetTokens.userId, record.userId), isNull(passwordResetTokens.consumedAt)));
    });
  } catch (error) {
    console.error("Failed to reset password", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CACHE_HEADERS });
  }

  return new NextResponse(null, { status: 204, headers: CACHE_HEADERS });
}
