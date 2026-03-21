import { Router, type IRouter } from "express";
import { db, departmentsTable } from "@workspace/db";
import { CreateDepartmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments", async (req, res) => {
  try {
    const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
    res.json(
      departments.map((d) => ({
        id: d.id,
        name: d.name,
        headcount: d.headcount,
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/departments", async (req, res) => {
  try {
    const body = CreateDepartmentBody.parse(req.body);
    const [dept] = await db.insert(departmentsTable).values(body).returning();
    res.status(201).json({
      id: dept.id,
      name: dept.name,
      headcount: dept.headcount,
      createdAt: dept.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
