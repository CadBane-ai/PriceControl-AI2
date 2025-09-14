import { NextResponse } from "next/server"

export async function POST() {
  // Placeholder webhook endpoint; implement Stripe signature verification later
  return NextResponse.json({ received: true })
}

