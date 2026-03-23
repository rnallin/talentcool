import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const emailAutomationsTable = pgTable("email_automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  template: text("template").notNull(),
  recipients: text("recipients").notNull().default(""),
  frequency: text("frequency").notNull().default("weekly"),
  dayOfWeek: integer("day_of_week").notNull().default(2),
  hour: integer("hour").notNull().default(8),
  minute: integer("minute").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
