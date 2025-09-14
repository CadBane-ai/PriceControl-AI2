import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

// Use a single pool for serverless compatibility on Vercel (keepAlive true)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  keepAlive: true,
})

export const db = drizzle(pool)
export type DB = typeof db

