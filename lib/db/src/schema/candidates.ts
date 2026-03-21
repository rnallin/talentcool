import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  stage: text("stage").notNull().default("triagem"), // triagem, entrevista_rh, entrevista_tecnica, proposta, contratado, reprovado
  source: text("source").notNull().default("outro"), // linkedin, indicacao, site, outro
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, appliedAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
