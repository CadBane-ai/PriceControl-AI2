import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { hashPassword } from "@/lib/password"

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { email, password, name } = RegisterSchema.parse(json)
    const normalizedEmail = email.toLowerCase()

    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail))
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    await db.insert(users).values({ email: normalizedEmail, name, passwordHash })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

