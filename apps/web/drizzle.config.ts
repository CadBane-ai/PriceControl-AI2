import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // The CLI reads this at runtime; ensure DATABASE_URL is set when running generate/migrate
    url: process.env.DATABASE_URL || "",
  },
  strict: true,
} satisfies Config;

