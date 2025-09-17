import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", ["free", "pro"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default("free"),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
