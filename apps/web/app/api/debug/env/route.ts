import { NextResponse } from "next/server";

export async function GET() {
  const envs = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET_SET: process.env.AUTH_SECRET ? "true" : "false",
    NEXTAUTH_SECRET_SET: process.env.NEXTAUTH_SECRET ? "true" : "false",
    DATABASE_URL_SET: process.env.DATABASE_URL ? "true" : "false",
  };
  return NextResponse.json(envs);
}
