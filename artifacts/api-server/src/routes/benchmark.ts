import { Router, type IRouter } from "express";
import { db, benchmarksTable, jobsTable } from "@workspace/db";
import { ilike, and, eq, SQL } from "drizzle-orm";

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

router.get("/benchmark/salary-bands", async (req, res) => {
  try {
    const jobTitle = typeof req.query.jobTitle === "string" ? req.query.jobTitle : null;
    const region = typeof req.query.region === "string" ? req.query.region : "São Paulo, SP";

    if (!jobTitle) {
      res.status(400).json({ error: "jobTitle é obrigatório" });
      return;
    }

    const conditions: SQL[] = [ilike(benchmarksTable.jobTitle, `%${jobTitle}%`)];
    if (region) conditions.push(ilike(benchmarksTable.region, `%${region}%`));

    const rows = await db
      .select()
      .from(benchmarksTable)
      .where(and(...conditions))
      .orderBy(benchmarksTable.seniority);

    const SENIORITY_ORDER: Record<string, number> = { junior: 0, pleno: 1, senior: 2 };

    const bands = rows
      .map((r) => {
        const min = parseFloat(r.minSalary as string);
        const median = parseFloat(r.medianSalary as string);
        const max = parseFloat(r.maxSalary as string);
        return {
          seniority: r.seniority,
          p10: min,
          p25: parseFloat(((min + median) / 2).toFixed(2)),
          median,
          p75: parseFloat(((median + max) / 2).toFixed(2)),
          p90: max,
          sampleSize: r.sampleSize,
        };
      })
      .sort((a, b) => (SENIORITY_ORDER[a.seniority] ?? 99) - (SENIORITY_ORDER[b.seniority] ?? 99));

    const internalJobs = await db
      .select({ minSalary: jobsTable.minSalary, maxSalary: jobsTable.maxSalary, seniority: jobsTable.seniority })
      .from(jobsTable)
      .where(and(ilike(jobsTable.title, `%${jobTitle}%`), eq(jobsTable.status, "open")));

    const internalBySeniority: Record<string, { sum: number; count: number }> = {};
    for (const j of internalJobs) {
      const s = j.seniority;
      const avg = (parseFloat(j.minSalary as string) + parseFloat(j.maxSalary as string)) / 2;
      if (!internalBySeniority[s]) internalBySeniority[s] = { sum: 0, count: 0 };
      internalBySeniority[s].sum += avg;
      internalBySeniority[s].count += 1;
    }

    const result = bands.map((b) => {
      const internal = internalBySeniority[b.seniority];
      return {
        ...b,
        internalSalary: internal ? parseFloat((internal.sum / internal.count).toFixed(2)) : null,
      };
    });

    res.json({ jobTitle, region, bands: result });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/benchmark/regional-variation", async (req, res) => {
  try {
    const jobTitle = typeof req.query.jobTitle === "string" ? req.query.jobTitle : null;
    const seniority = typeof req.query.seniority === "string" ? req.query.seniority : "pleno";

    if (!jobTitle) {
      res.status(400).json({ error: "jobTitle é obrigatório" });
      return;
    }

    const rows = await db
      .select()
      .from(benchmarksTable)
      .where(
        and(
          ilike(benchmarksTable.jobTitle, `%${jobTitle}%`),
          eq(benchmarksTable.seniority, seniority)
        )
      )
      .orderBy(benchmarksTable.region);

    const spRow = rows.find((r) => r.region.toLowerCase().includes("são paulo"));
    const spMedian = spRow ? parseFloat(spRow.medianSalary as string) : null;

    const result = rows.map((r) => {
      const median = parseFloat(r.medianSalary as string);
      return {
        region: r.region,
        medianSalary: median,
        index: spMedian ? Math.round((median / spMedian) * 100) : 100,
        sampleSize: r.sampleSize,
      };
    });

    result.sort((a, b) => b.index - a.index);

    res.json({ jobTitle, seniority, regions: result });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
