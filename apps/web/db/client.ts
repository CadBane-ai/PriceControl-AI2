import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  // It's okay during local dev without DB, but migrations require this
  // eslint-disable-next-line no-console
  console.warn("DATABASE_URL not set. DB client will not be usable until it's provided.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon typically requires SSL; if needed, you can uncomment the following:
  // ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);
export type DB = typeof db;

