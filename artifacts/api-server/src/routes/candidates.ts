import { Router, type IRouter } from "express";
import { db, candidatesTable, pipelineStagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCandidateBody, UpdateCandidateBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getValidStageNames(): Promise<Set<string>> {
  const stages = await db.select({ name: pipelineStagesTable.name }).from(pipelineStagesTable);
  return new Set(stages.map((s) => s.name));
}

function candidateToResponse(c: typeof candidatesTable.$inferSelect) {
  return {
    id: c.id,
    jobId: c.jobId,
    name: c.name,
    email: c.email,
    phone: c.phone ?? null,
    stage: c.stage,
    source: c.source,
    appliedAt: c.appliedAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    notes: c.notes ?? null,
  };
}

router.get("/jobs/:id/candidates", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) { res.status(400).json({ error: "ID inválido" }); return; }
    const candidates = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.jobId, jobId))
      .orderBy(candidatesTable.appliedAt);

    res.json(candidates.map(candidateToResponse));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/jobs/:id/candidates", async (req, res) => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) { res.status(400).json({ error: "ID inválido" }); return; }
    const body = parsed.data;

    const validStages = await getValidStageNames();
    if (!validStages.has(body.stage)) {
      res.status(400).json({
        error: `Invalid stage "${body.stage}". Valid stages: ${[...validStages].join(", ")}`,
      });
      return;
    }

    const [candidate] = await db
      .insert(candidatesTable)
      .values({
        jobId,
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        stage: body.stage,
        source: body.source,
        notes: body.notes ?? null,
      })
      .returning();

    res.status(201).json(candidateToResponse(candidate));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

router.patch("/candidates/:id", async (req, res) => {
  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    const body = parsed.data;

    if (body.stage !== undefined) {
      const validStages = await getValidStageNames();
      if (!validStages.has(body.stage)) {
        res.status(400).json({
          error: `Invalid stage "${body.stage}". Valid stages: ${[...validStages].join(", ")}`,
        });
        return;
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.stage !== undefined) updateData.stage = body.stage;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.phone !== undefined) updateData.phone = body.phone;

    const [updated] = await db
      .update(candidatesTable)
      .set(updateData)
      .where(eq(candidatesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    res.json(candidateToResponse(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/candidates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
