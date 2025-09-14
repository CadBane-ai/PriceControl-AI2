import { NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"
import { addHours } from "date-fns"
import { db } from "@/db"
import { users, passwordResetTokens } from "@/db/schema"
import { eq } from "drizzle-orm"

const ForgotSchema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { email } = ForgotSchema.parse(json)
    const normalizedEmail = email.toLowerCase()

    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1)
    if (!user) {
      // Avoid user enumeration; return 200
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = addHours(new Date(), 1)
    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    const url = `${baseUrl}/reset-password?token=${token}`

    // Send email via Resend if configured
    if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.MAIL_FROM,
            to: user.email,
            subject: "Reset your PriceControl password",
            html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
          }),
        })
        if (!res.ok) console.error("Resend error", await res.text())
      } catch (e) {
        console.error("Email send failed", e)
      }
    } else {
      console.log("Password reset URL:", url)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

