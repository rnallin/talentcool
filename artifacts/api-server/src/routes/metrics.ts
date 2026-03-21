import { Router, type IRouter } from "express";
import { db, jobsTable, candidatesTable, departmentsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/metrics/overview", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [openJobsResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(jobsTable)
      .where(eq(jobsTable.status, "open"));

    const [totalCandidatesResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(candidatesTable);

    const hired = await db
      .select({
        appliedAt: candidatesTable.appliedAt,
        updatedAt: candidatesTable.updatedAt,
      })
      .from(candidatesTable)
      .where(eq(candidatesTable.stage, "contratado"));

    const avgTimeToHire =
      hired.length > 0
        ? hired.reduce((sum, h) => {
            const days = Math.floor(
              (h.updatedAt.getTime() - h.appliedAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / hired.length
        : 0;

    const hiresThisMonth = hired.filter(
      (h) => h.updatedAt >= startOfMonth
    ).length;
    const hiresLastMonth = hired.filter(
      (h) => h.updatedAt >= startOfLastMonth && h.updatedAt <= endOfLastMonth
    ).length;

    const openJobs = await db
      .select({ minSalary: jobsTable.minSalary, maxSalary: jobsTable.maxSalary, openedAt: jobsTable.openedAt })
      .from(jobsTable)
      .where(eq(jobsTable.status, "open"));

    const CHARGES_RATE = 0.68;
    const totalOpenJobsCost = openJobs.reduce((sum, j) => {
      const avgSalary = (parseFloat(j.minSalary as string) + parseFloat(j.maxSalary as string)) / 2;
      return sum + avgSalary * (1 + CHARGES_RATE);
    }, 0);

    const [promotersResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(candidatesTable)
      .where(eq(candidatesTable.stage, "contratado"));

    const [detractorsResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(candidatesTable)
      .where(eq(candidatesTable.stage, "reprovado"));

    const total = totalCandidatesResult.count;
    const candidateNps =
      total > 0
        ? parseFloat(
            (((promotersResult.count - detractorsResult.count) / total) * 100).toFixed(1)
          )
        : 0;

    res.json({
      totalOpenJobs: openJobsResult.count,
      totalCandidates: totalCandidatesResult.count,
      avgTimeToHireDays: parseFloat(avgTimeToHire.toFixed(1)),
      hiresThisMonth,
      hiresLastMonth,
      openJobsGrowth: 0,
      candidatesGrowth: 0,
      totalOpenJobsCost: parseFloat(totalOpenJobsCost.toFixed(2)),
      candidateNps,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/metrics/time-to-hire", async (req, res) => {
  try {
    const hired = await db
      .select({
        dept: departmentsTable.name,
        appliedAt: candidatesTable.appliedAt,
        updatedAt: candidatesTable.updatedAt,
        jobId: candidatesTable.jobId,
      })
      .from(candidatesTable)
      .leftJoin(jobsTable, eq(candidatesTable.jobId, jobsTable.id))
      .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
      .where(eq(candidatesTable.stage, "contratado"));

    const byDept: Record<string, { total: number; count: number }> = {};
    for (const h of hired) {
      const dept = h.dept ?? "Sem departamento";
      const days = Math.floor(
        (h.updatedAt.getTime() - h.appliedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (!byDept[dept]) byDept[dept] = { total: 0, count: 0 };
      byDept[dept].total += days;
      byDept[dept].count += 1;
    }

    const result = Object.entries(byDept).map(([department, data]) => ({
      department,
      avgDays: parseFloat((data.total / data.count).toFixed(1)),
      hires: data.count,
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/metrics/funnel", async (req, res) => {
  try {
    const stages = [
      { stage: "triagem", label: "Triagem" },
      { stage: "entrevista_rh", label: "Entrevista RH" },
      { stage: "entrevista_tecnica", label: "Entrevista Técnica" },
      { stage: "proposta", label: "Proposta" },
      { stage: "contratado", label: "Contratado" },
      { stage: "reprovado", label: "Reprovado" },
    ];

    const [totalResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(candidatesTable);
    const total = totalResult.count;

    const counts = await Promise.all(
      stages.map(async (s) => {
        const [r] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(candidatesTable)
          .where(eq(candidatesTable.stage, s.stage));
        return { ...s, count: r.count };
      })
    );

    const result = counts.map((s) => ({
      stage: s.stage,
      label: s.label,
      count: s.count,
      conversionRate: total > 0 ? parseFloat(((s.count / total) * 100).toFixed(1)) : 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/metrics/hires-over-time", async (req, res) => {
  try {
    const result = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [hiresResult] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(candidatesTable)
        .where(
          and(
            eq(candidatesTable.stage, "contratado"),
            sql`${candidatesTable.updatedAt} >= ${monthStart}`,
            sql`${candidatesTable.updatedAt} <= ${monthEnd}`
          )
        );

      const [openingsResult] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(jobsTable)
        .where(
          sql`${jobsTable.openedAt} >= ${monthStart} and ${jobsTable.openedAt} <= ${monthEnd}`
        );

      const monthLabel = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      result.push({
        month: monthLabel,
        hires: hiresResult.count,
        openings: openingsResult.count,
      });
    }

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
