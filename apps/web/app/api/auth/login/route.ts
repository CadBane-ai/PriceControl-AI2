import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    // For session cookie issuance, clients should use NextAuth's Credentials flow.
    // This endpoint provides guidance to the client.
    return NextResponse.json({
      message:
        "Use NextAuth Credentials: call signIn('credentials', { email, password, redirect: false }) or POST to /api/auth/callback/credentials with form data.",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
