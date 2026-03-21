import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  departmentId: integer("department_id").notNull(),
  status: text("status").notNull().default("open"), // open, closed, paused
  seniority: text("seniority").notNull(), // junior, pleno, senior, especialista, gerente, diretor
  minSalary: numeric("min_salary", { precision: 12, scale: 2 }).notNull(),
  maxSalary: numeric("max_salary", { precision: 12, scale: 2 }).notNull(),
  location: text("location").notNull(),
  workMode: text("work_mode").notNull(), // presencial, hibrido, remoto
  requirements: text("requirements"),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, openedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
