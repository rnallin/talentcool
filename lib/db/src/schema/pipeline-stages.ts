import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const pipelineStagesTable = pgTable("pipeline_stages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  color: text("color").notNull().default("border-slate-200 bg-slate-50"),
  position: integer("position").notNull().default(0),
  isTerminal: boolean("is_terminal").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PipelineStage = typeof pipelineStagesTable.$inferSelect;
