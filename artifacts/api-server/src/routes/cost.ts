import { Router, type IRouter } from "express";
import { db, jobsTable, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const CHARGES_RATE = 0.68;

router.get("/cost/open-jobs", async (req, res) => {
  try {
    const openJobs = await db
      .select({
        job: jobsTable,
        deptName: departmentsTable.name,
      })
      .from(jobsTable)
      .leftJoin(departmentsTable, eq(jobsTable.departmentId, departmentsTable.id))
      .where(eq(jobsTable.status, "open"));

    const now = new Date();
    const jobCosts = openJobs.map((r) => {
      const openedAt = new Date(r.job.openedAt);
      const daysOpen = Math.floor((now.getTime() - openedAt.getTime()) / (1000 * 60 * 60 * 24));

      const minSalary = parseFloat(r.job.minSalary as string);
      const maxSalary = parseFloat(r.job.maxSalary as string);
      const avgSalary = (minSalary + maxSalary) / 2;

      const monthlyCost = avgSalary * (1 + CHARGES_RATE);
      const dailyCost = monthlyCost / 22; // working days
      const weeklyCost = dailyCost * 5;
      const totalAccruedCost = dailyCost * daysOpen;

      return {
        jobId: r.job.id,
        jobTitle: r.job.title,
        department: r.deptName ?? "N/A",
        daysOpen,
        avgSalary: parseFloat(avgSalary.toFixed(2)),
        monthlyCost: parseFloat(monthlyCost.toFixed(2)),
        weeklyCost: parseFloat(weeklyCost.toFixed(2)),
        dailyCost: parseFloat(dailyCost.toFixed(2)),
        totalAccruedCost: parseFloat(totalAccruedCost.toFixed(2)),
      };
    });

    const totalMonthlyCost = jobCosts.reduce((sum, j) => sum + j.monthlyCost, 0);
    const totalWeeklyCost = jobCosts.reduce((sum, j) => sum + j.weeklyCost, 0);
    const totalDailyCost = jobCosts.reduce((sum, j) => sum + j.dailyCost, 0);

    res.json({
      totalMonthlyCost: parseFloat(totalMonthlyCost.toFixed(2)),
      totalWeeklyCost: parseFloat(totalWeeklyCost.toFixed(2)),
      totalDailyCost: parseFloat(totalDailyCost.toFixed(2)),
      chargesRate: CHARGES_RATE,
      jobs: jobCosts,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
