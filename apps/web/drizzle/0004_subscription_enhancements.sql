DO $$ BEGIN
    CREATE TYPE "subscription_status" AS ENUM ('free', 'pro');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" "subscription_status" NOT NULL DEFAULT 'free';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan_expires_at" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "password_reset_tokens" RENAME COLUMN "used_at" TO "consumed_at";
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_idx" ON "password_reset_tokens" USING btree ("expires_at");
