import { NextResponse } from "next/server"

export async function GET() {
  // TODO: compute from DB and plan; temporary static for wiring
  const dailyLimit = Number(process.env.DAILY_LIMIT ?? 20)
  return NextResponse.json({ plan: "free", usedToday: 0, dailyLimit })
}

