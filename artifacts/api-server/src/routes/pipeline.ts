import { Router, type IRouter } from "express";
import { db, pipelineStagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePipelineStageBody,
  UpdatePipelineStageParams,
  UpdatePipelineStageBody,
  DeletePipelineStageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function stageToResponse(s: typeof pipelineStagesTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    label: s.label,
    color: s.color,
    position: s.position,
    isTerminal: s.isTerminal,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/pipeline/stages", async (req, res) => {
  try {
    const stages = await db
      .select()
      .from(pipelineStagesTable)
      .orderBy(pipelineStagesTable.position);
    res.json(stages.map(stageToResponse));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/pipeline/stages", async (req, res) => {
  const parsed = CreatePipelineStageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const { name, label, color, position, isTerminal } = parsed.data;
    const [stage] = await db
      .insert(pipelineStagesTable)
      .values({
        name,
        label,
        color: color ?? "border-slate-200 bg-slate-50",
        position: position ?? 99,
        isTerminal: isTerminal ?? false,
      })
      .returning();

    res.status(201).json(stageToResponse(stage));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Could not create stage" });
  }
});

router.patch("/pipeline/stages/:id", async (req, res) => {
  const paramsParsed = UpdatePipelineStageParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid stage id" });
    return;
  }

  const bodyParsed = UpdatePipelineStageBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  try {
    const { id } = paramsParsed.data;
    const updateData: Partial<typeof pipelineStagesTable.$inferInsert> = {};
    const { label, color, position, isTerminal } = bodyParsed.data;
    if (label !== undefined) updateData.label = label;
    if (color !== undefined) updateData.color = color;
    if (position !== undefined) updateData.position = position;
    if (isTerminal !== undefined) updateData.isTerminal = isTerminal;

    const [updated] = await db
      .update(pipelineStagesTable)
      .set(updateData)
      .where(eq(pipelineStagesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Stage not found" });
      return;
    }

    res.json(stageToResponse(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/pipeline/stages/:id", async (req, res) => {
  const paramsParsed = DeletePipelineStageParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid stage id" });
    return;
  }

  try {
    await db
      .delete(pipelineStagesTable)
      .where(eq(pipelineStagesTable.id, paramsParsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
