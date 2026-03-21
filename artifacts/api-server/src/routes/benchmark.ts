import { Router, type IRouter } from "express";
import { db, benchmarksTable } from "@workspace/db";
import { ilike, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/benchmark", async (req, res) => {
  try {
    let query = db.select().from(benchmarksTable).$dynamic();

    if (req.query.region) {
      query = query.where(ilike(benchmarksTable.region, `%${req.query.region}%`));
    }
    if (req.query.jobTitle) {
      query = query.where(ilike(benchmarksTable.jobTitle, `%${req.query.jobTitle}%`));
    }

    const benchmarks = await query.orderBy(benchmarksTable.jobTitle, benchmarksTable.seniority);

    res.json(
      benchmarks.map((b) => ({
        id: b.id,
        jobTitle: b.jobTitle,
        seniority: b.seniority,
        region: b.region,
        minSalary: parseFloat(b.minSalary as string),
        medianSalary: parseFloat(b.medianSalary as string),
        maxSalary: parseFloat(b.maxSalary as string),
        sampleSize: b.sampleSize,
        updatedAt: b.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/benchmark/regions", async (req, res) => {
  try {
    const regions = await db
      .selectDistinct({ region: benchmarksTable.region })
      .from(benchmarksTable)
      .orderBy(benchmarksTable.region);
    res.json(regions.map((r) => r.region));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/benchmark/job-titles", async (req, res) => {
  try {
    const titles = await db
      .selectDistinct({ jobTitle: benchmarksTable.jobTitle })
      .from(benchmarksTable)
      .orderBy(benchmarksTable.jobTitle);
    res.json(titles.map((t) => t.jobTitle));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
