import { Router, type IRouter } from "express";
import { db, jobsTable, departmentsTable, candidatesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobBody,
  ListJobsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function jobToResponse(
  job: typeof jobsTable.$inferSelect,
  deptName: string,
  candidateCount: number
) {
  const now = new Date();
  const openedAt = new Date(job.openedAt);
  const daysOpen = Math.floor((now.getTime() - openedAt.getTime()) / (1000 * 60 * 60 * 24));
  return {
    id: job.id,
    title: job.title,
    departmentId: job.departmentId,
    departmentName: deptName,
    status: job.status,
    seniority: job.seniority,
    minSalary: parseFloat(job.minSalary as string),
    maxSalary: parseFloat(job.maxSalary as string),
    location: job.location,
    workMode: job.workMode,
    requirements: job.requirements ?? null,
    openedAt: job.openedAt.toISOString(),
    closedAt: job.closedAt ? job.closedAt.toISOString() : null,
    candidateCount,
    daysOpen,
  };
}

router.get("/jobs", async (req, res) => {
  try {
    const query = ListJobsQueryParams.parse(req.query);

    const allJobs = await db
      .select({
        job: jobsTable,
        deptName: departmentsTable.name,
        candidateCount: sql<number>`cast(count(${candidatesTable.id}) as int)`,
      })
      .from(jobsTable)
      .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
      .leftJoin(candidatesTable, eq(candidatesTable.jobId, jobsTable.id))
      .groupBy(jobsTable.id, departmentsTable.name)
      .orderBy(jobsTable.openedAt);

    let result = allJobs;
    if (query.status) {
      result = result.filter((r) => r.job.status === query.status);
    }
    if (query.departmentId) {
      result = result.filter((r) => r.job.departmentId === Number(query.departmentId));
    }

    res.json(
      result.map((r) =>
        jobToResponse(r.job, r.deptName ?? "N/A", Number(r.candidateCount))
      )
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/jobs", async (req, res) => {
  try {
    const body = CreateJobBody.parse(req.body);
    const [job] = await db
      .insert(jobsTable)
      .values({
        title: body.title,
        departmentId: body.departmentId,
        status: body.status,
        seniority: body.seniority,
        minSalary: String(body.minSalary),
        maxSalary: String(body.maxSalary),
        location: body.location,
        workMode: body.workMode,
        requirements: body.requirements ?? null,
      })
      .returning();

    const dept = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, job.departmentId))
      .limit(1);

    res.status(201).json(jobToResponse(job, dept[0]?.name ?? "N/A", 0));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    const rows = await db
      .select({
        job: jobsTable,
        deptName: departmentsTable.name,
      })
      .from(jobsTable)
      .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
      .where(eq(jobsTable.id, id))
      .limit(1);

    if (!rows.length) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const candidates = await db
      .select()
      .from(candidatesTable)
      .where(eq(candidatesTable.jobId, id))
      .orderBy(candidatesTable.appliedAt);

    const row = rows[0];
    const jobData = jobToResponse(row.job, row.deptName ?? "N/A", candidates.length);

    res.json({
      ...jobData,
      candidates: candidates.map((c) => ({
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
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    const body = UpdateJobBody.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "closed") {
        updateData.closedAt = new Date();
      }
    }
    if (body.seniority !== undefined) updateData.seniority = body.seniority;
    if (body.minSalary !== undefined) updateData.minSalary = String(body.minSalary);
    if (body.maxSalary !== undefined) updateData.maxSalary = String(body.maxSalary);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.workMode !== undefined) updateData.workMode = body.workMode;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;

    const [updated] = await db
      .update(jobsTable)
      .set(updateData)
      .where(eq(jobsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const dept = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, updated.departmentId))
      .limit(1);

    const candidateCount = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(candidatesTable)
      .where(eq(candidatesTable.jobId, id));

    res.json(jobToResponse(updated, dept[0]?.name ?? "N/A", Number(candidateCount[0]?.count ?? 0)));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

router.delete("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
    await db.delete(candidatesTable).where(eq(candidatesTable.jobId, id));
    await db.delete(jobsTable).where(eq(jobsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
