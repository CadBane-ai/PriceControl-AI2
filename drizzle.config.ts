import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: ["pricecontrol_*"],
} satisfies Config;