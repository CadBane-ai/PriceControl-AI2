import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    await db.query.users.findFirst();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}