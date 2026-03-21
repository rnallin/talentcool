import { Router, type IRouter } from "express";
import { db, companySettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateCompanySettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getSettingsObject() {
  const rows = await db.select().from(companySettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    chargesRate: parseFloat(map.charges_rate ?? "0.68"),
    workingDaysPerMonth: parseInt(map.working_days_per_month ?? "22"),
    companyName: map.company_name ?? "Empresa Demo",
  };
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await db
    .insert(companySettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({
      target: companySettingsTable.key,
      set: { value, updatedAt: new Date() },
    });
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
  const parsed = UpdateCompanySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const { chargesRate, workingDaysPerMonth, companyName } = parsed.data;

    const updates: Promise<void>[] = [];
    if (chargesRate !== undefined) {
      updates.push(upsertSetting("charges_rate", String(chargesRate)));
    }
    if (workingDaysPerMonth !== undefined) {
      updates.push(upsertSetting("working_days_per_month", String(workingDaysPerMonth)));
    }
    if (companyName !== undefined) {
      updates.push(upsertSetting("company_name", companyName));
    }

    await Promise.all(updates);
    res.json(await getSettingsObject());
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getSettingsObject };
export default router;
