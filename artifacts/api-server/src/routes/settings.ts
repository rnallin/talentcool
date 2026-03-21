import { Router, type IRouter } from "express";
import { db, companySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getSettingValue(key: string, fallback: string): Promise<string> {
  const [row] = await db
    .select()
    .from(companySettingsTable)
    .where(eq(companySettingsTable.key, key))
    .limit(1);
  return row?.value ?? fallback;
}

async function getSettingsObject() {
  const rows = await db.select().from(companySettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    chargesRate: parseFloat(map.charges_rate ?? "0.68"),
    workingDaysPerMonth: parseInt(map.working_days_per_month ?? "22"),
    companyName: map.company_name ?? "Empresa Demo",
  };
}

router.get("/settings", async (req, res) => {
  try {
    res.json(await getSettingsObject());
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const body = req.body as {
      chargesRate?: number;
      workingDaysPerMonth?: number;
      companyName?: string;
    };

    const updates: { key: string; value: string }[] = [];
    if (body.chargesRate !== undefined) {
      updates.push({ key: "charges_rate", value: String(body.chargesRate) });
    }
    if (body.workingDaysPerMonth !== undefined) {
      updates.push({ key: "working_days_per_month", value: String(body.workingDaysPerMonth) });
    }
    if (body.companyName !== undefined) {
      updates.push({ key: "company_name", value: body.companyName });
    }

    for (const { key, value } of updates) {
      await db
        .update(companySettingsTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(companySettingsTable.key, key));
    }

    res.json(await getSettingsObject());
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

export { getSettingValue };
export default router;
