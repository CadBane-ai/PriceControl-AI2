import { pgTable, uuid, varchar, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    title: varchar("title", { length: 255 }).notNull().default("Untitled conversation"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => {
    return {
      userUpdatedIdx: index("conversations_user_updated_idx").on(table.userId, table.updatedAt),
    }
  }
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    role: varchar("role", { length: 16 }).notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => {
    return {
      convoCreatedIdx: index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    }
  }
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
