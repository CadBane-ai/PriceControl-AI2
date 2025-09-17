import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function noStoreInit(status: number) {
  return { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } } as const;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        noStoreInit(400)
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, noStoreInit(409));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await db
      .insert(users)
      .values({ email: normalizedEmail, passwordHash })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(
      { user: inserted[0] },
      noStoreInit(201)
    );
  } catch (err) {
    console.error("/api/auth/register error", err);
    return NextResponse.json({ error: "Internal server error" }, noStoreInit(500));
  }
}

export async function GET() {
  // Prevent accidental cache hits and make it clear GET is not supported
  return NextResponse.json({ error: "Method Not Allowed" }, noStoreInit(405));
}
