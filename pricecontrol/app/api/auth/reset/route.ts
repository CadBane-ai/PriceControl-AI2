import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { passwordResetTokens, users } from "@/db/schema"
import { and, eq, gt } from "drizzle-orm"
import { hashPassword } from "@/lib/password"

const ResetSchema = z.object({ token: z.string(), password: z.string().min(8) })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { token, password } = ResetSchema.parse(json)

    const now = new Date()
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, now)))
      .limit(1)

    if (!record) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })

    const passwordHash = await hashPassword(password)
    await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId))
    // delete token after use
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, record.id))

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}

