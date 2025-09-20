import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", ["free", "pro"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("free").notNull(),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  sessionVersion: integer("session_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
