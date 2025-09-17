import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, createPasswordResetToken, RESET_TOKEN_TTL_MINUTES } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";

const ForgotSchema = z.object({
  email: z.string().email(),
});

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

const IP_LIMIT_WINDOW = 60 * 60; // 1 hour
const IP_LIMIT = 20;
const ACCOUNT_LIMIT = 5;

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

  const parsed = ForgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: CACHE_HEADERS });
  }

  const ip = getClientIp(req);
  const ipLimit = await enforceRateLimit({ key: `password-reset:ip:${ip}`, limit: IP_LIMIT, windowSeconds: IP_LIMIT_WINDOW });
  if (!ipLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: CACHE_HEADERS });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await findUserByEmail(email);

  if (user) {
    const accountLimit = await enforceRateLimit({
      key: `password-reset:user:${user.id}`,
      limit: ACCOUNT_LIMIT,
      windowSeconds: IP_LIMIT_WINDOW,
    });

    if (accountLimit.success) {
      try {
        const { token, expiresAt } = await createPasswordResetToken(user.id);
        const origin = process.env.NEXTAUTH_URL || process.env.PUBLIC_APP_URL || "http://localhost:3000";
        const resetUrl = new URL("/reset-password", origin);
        resetUrl.searchParams.set("token", token);

        await sendPasswordResetEmail({
          to: email,
          resetUrl: resetUrl.toString(),
          expiresMinutes: RESET_TOKEN_TTL_MINUTES,
        });
      } catch (error) {
        console.error("Failed to issue password reset token", error);
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 202, headers: CACHE_HEADERS });
}
