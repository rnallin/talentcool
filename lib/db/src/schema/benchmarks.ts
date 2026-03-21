import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const benchmarksTable = pgTable("benchmarks", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  seniority: text("seniority").notNull(),
  region: text("region").notNull(),
  minSalary: numeric("min_salary", { precision: 12, scale: 2 }).notNull(),
  medianSalary: numeric("median_salary", { precision: 12, scale: 2 }).notNull(),
  maxSalary: numeric("max_salary", { precision: 12, scale: 2 }).notNull(),
  sampleSize: integer("sample_size").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBenchmarkSchema = createInsertSchema(benchmarksTable).omit({ id: true, updatedAt: true });
export type InsertBenchmark = z.infer<typeof insertBenchmarkSchema>;
export type Benchmark = typeof benchmarksTable.$inferSelect;
