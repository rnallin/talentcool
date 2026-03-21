import { Router, type IRouter } from "express";
import { db, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCandidateBody, UpdateCandidateBody } from "@workspace/api-zod";

const router: IRouter = Router();

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
  try {
    const jobId = parseInt(req.params.id);
    const body = CreateCandidateBody.parse(req.body);

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
  try {
    const id = parseInt(req.params.id);
    const body = UpdateCandidateBody.parse(req.body);

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
      return res.status(404).json({ error: "Candidate not found" });
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
    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
