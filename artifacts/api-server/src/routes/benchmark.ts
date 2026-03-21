import { Router, type IRouter } from "express";
import { db, benchmarksTable } from "@workspace/db";
import { ilike, and, SQL } from "drizzle-orm";

const router: IRouter = Router();

router.get("/benchmark", async (req, res) => {
  try {
    const conditions: SQL[] = [];

    if (req.query.region && typeof req.query.region === "string") {
      conditions.push(ilike(benchmarksTable.region, `%${req.query.region}%`));
    }
    if (req.query.jobTitle && typeof req.query.jobTitle === "string") {
      conditions.push(ilike(benchmarksTable.jobTitle, `%${req.query.jobTitle}%`));
    }

    const benchmarks = await db
      .select()
      .from(benchmarksTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(benchmarksTable.jobTitle, benchmarksTable.seniority);

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
