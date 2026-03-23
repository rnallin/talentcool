import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const emailDraftsTable = pgTable("email_drafts", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull().default(""),
  recipients: text("recipients").notNull().default(""),
  content: text("content").notNull().default(""),
  template: text("template").notNull().default("custom"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});
