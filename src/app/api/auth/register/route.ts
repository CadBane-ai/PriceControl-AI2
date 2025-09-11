import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 },
      );
    }

    await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      passwordHash: hashedPassword,
    });

    return NextResponse.json({ message: "User created successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while creating the user." },
      { status: 500 },
    );
  }
}