import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'ep-mute-haze-adafk7yr-pooler.c-2.us-east-1.aws.neon.tech',
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_5ezG8PvwYTBI',
    ssl: {
      rejectUnauthorized: false
    }
  },
  verbose: true,
  strict: true,
} satisfies Config;