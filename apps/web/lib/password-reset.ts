import { randomBytes, createHash } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { passwordResetTokens } from "@/db/schema/password-reset-tokens";
import { users } from "@/db/schema/users";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(): { token: string; hash: string; expiresAt: Date } {
  const token = randomBytes(RESET_TOKEN_BYTES).toString("base64url");
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { token, hash, expiresAt };
}

export function hashToken(token: string): string {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  const payload = secret ? `${secret}:${token}` : token;
  return createHash("sha256").update(payload).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const { token, hash, expiresAt } = generateResetToken();

  await db.transaction(async (tx) => {
    await tx
      .delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.consumedAt)));

    await tx.insert(passwordResetTokens).values({
      userId,
      tokenHash: hash,
      expiresAt,
    });
  });

  return { token, expiresAt };
}

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result[0];
}

type PasswordResetExecutor = {
  update: typeof db.update;
};

export async function consumePasswordResetToken(
  token: string,
  executor: PasswordResetExecutor = db,
  tokenHash?: string
) {
  const hash = tokenHash ?? hashToken(token);
  const now = new Date();
  const [record] = await executor
    .update(passwordResetTokens)
    .set({ consumedAt: now })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hash),
        gt(passwordResetTokens.expiresAt, now),
        isNull(passwordResetTokens.consumedAt)
      )
    )
    .returning({ id: passwordResetTokens.id, userId: passwordResetTokens.userId });
  return record;
}

export const RESET_TOKEN_TTL_MINUTES = RESET_TOKEN_TTL_MS / 60000;
