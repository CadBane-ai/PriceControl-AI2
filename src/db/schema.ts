import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Example of how relations might be defined if needed later
// export const userRelations = relations(users, ({ many }) => ({
//   posts: many(posts), // Assuming a 'posts' table exists
// }));