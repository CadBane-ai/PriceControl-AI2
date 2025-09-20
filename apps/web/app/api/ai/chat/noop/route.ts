import { NextResponse } from "next/server"

// This is a no-op route to prevent 404 errors during client-side-only development.
// It will be replaced by the actual chat streaming API in Story 2.3.
export async function POST(req: Request) {
  return new NextResponse("", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}
